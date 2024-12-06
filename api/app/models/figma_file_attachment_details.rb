# frozen_string_literal: true

class FigmaFileAttachmentDetails
  include ActiveModel::Model
  include ImgixUrlBuilder

  attr_accessor :organization, :figma_file_url, :file_path, :image_urls, :url, :width, :height, :size, :file_type, :figma_file_id, :remote_figma_node_id, :remote_figma_node_name, :remote_figma_node_type, :figma_share_url

  validates :figma_file_uri, presence: true

  def save!
    validate!

    figma_file.update!(name: api_figma_file_name)

    S3_BUCKET.object(s3_key).put(body: tempfile)

    assign_attributes(
      file_path: s3_key,
      figma_file_id: figma_file.id,
      image_urls: ImageUrls.new(file_path: s3_key),
      width: image_size[0],
      height: image_size[1],
      size: tempfile.size,
      file_type: tempfile.content_type,
      remote_figma_node_id: api_node_id,
      remote_figma_node_name: api_node_name,
      remote_figma_node_type: api_node_type,
      figma_share_url: figma_file_url,
    )

    self
  end

  private

  def s3_key
    @s3_key ||= organization.generate_post_s3_key(tempfile.content_type)
  end

  def tempfile
    @tempfile ||= Down.download(image_url, max_size: organization.file_size_bytes_limit)
  end

  def image_url
    @image_url ||= figma_client.image(file_key: file_key, node_id: api_node_id, scale: 2, format: "png")
  end

  def api_figma_file_name
    @api_figma_file_name ||= api_figma_file_nodes&.name || api_figma_file.name
  end

  def api_node_id
    @api_node_id ||= api_node&.id || api_figma_file.first_page_id
  end

  def api_node_name
    @api_node_name ||= api_node&.name || api_figma_file.first_page_name
  end

  def api_node_type
    @api_node_type ||= api_node&.type || api_figma_file.first_page_type
  end

  def api_figma_file
    @api_figma_file ||= figma_client.file(file_key)
  end

  def image_size
    @image_size ||= FastImage.size(tempfile, raise_on_failure: true)
  end

  def api_node
    @api_node ||= api_figma_file_nodes&.nodes&.first
  end

  def api_figma_file_nodes
    return unless node_id

    @api_figma_file_nodes ||= figma_client.file_nodes(file_key: file_key, node_ids: [node_id])
  end

  def figma_file
    @figma_file ||= FigmaFile.find_or_initialize_by(remote_file_key: file_key)
  end

  def node_id
    @node_id ||= Hash[URI.decode_www_form(figma_file_uri.query || "")]["node-id"]
  end

  def file_key
    @file_key ||= figma_file_uri.path.match(%r{^/([\w-]+)/(?<file_key>[^/]+)})[:file_key]
  end

  def figma_file_uri
    @figma_file_uri ||= URI.parse(figma_file_url)
  rescue URI::InvalidURIError
    nil
  end

  def figma_client
    @figma_client ||= FigmaClient.new(Current.user.figma_integration.token!)
  end
end
