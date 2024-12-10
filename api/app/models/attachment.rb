# frozen_string_literal: true

class Attachment < ApplicationRecord
  include PublicIdGenerator
  include ImgixUrlBuilder

  FILE_TYPES_TO_EXTENSION = {
    "image/gif" => "gif",
    "image/jpeg" => "jpg",
    "image/jpg" => "jpg",
    "image/png" => "png",
    "image/svg+xml" => "svg",
    "image/heic" => "heic",
    "video/mp4" => "mp4",
    "video/webm" => "webm",
    "video/quicktime" => "mov",
    "origami" => "origami",
    "principle" => "prd",
    "lottie" => "json",
    "stitch" => "stitch",
  }.freeze

  FILE_TYPES = FILE_TYPES_TO_EXTENSION.keys.to_set.freeze

  LINK_TYPES = [
    "link",
    "loom",
    "figma",
  ].to_set.freeze

  # matches URLs like https://loom.com/something and https://subdomain.loom.com/something
  LOOM_LINK_REGEX = %r{[/\.]loom\.com}

  # matches URLs like https://figma.com/something and https://subdomain.figma.com/something
  FIGMA_LINK_REGEX = %r{[/\.]figma\.com}

  # https://www.figma.com/plugin-docs/api/nodes/#NodeType
  enum :remote_figma_node_type,
    {
      BOOLEAN_OPERATION: 0,
      CODE_BLOCK: 1,
      COMPONENT: 2,
      COMPONENT_SET: 3,
      CONNECTOR: 4,
      DOCUMENT: 5,
      ELLIPSE: 6,
      EMBED: 7,
      FRAME: 8,
      GROUP: 9,
      HIGHLIGHT: 10,
      INSTANCE: 11,
      LINE: 12,
      LINK_UNFURL: 13,
      MEDIA: 14,
      PAGE: 15,
      POLYGON: 16,
      RECTANGLE: 17,
      SHAPE_WITH_TEXT: 18,
      SLICE: 19,
      STAMP: 20,
      STAR: 21,
      STICKY: 22,
      TABLE: 23,
      TABLE_CELL: 24,
      TEXT: 25,
      VECTOR: 26,
      WIDGET: 27,
      WASHI_TAPE: 28,
      SECTION: 29,
      CANVAS: 30,
    }

  belongs_to :subject, polymorphic: true, optional: true
  has_many :comments, class_name: "Comment"
  belongs_to :figma_file, optional: true

  validates :remote_figma_node_id, presence: true, if: -> { connected_to_figma? }
  validates :remote_figma_node_type, presence: true, if: -> { connected_to_figma? }
  validates :remote_figma_node_name, presence: true, if: -> { connected_to_figma? }
  validates :file_path, presence: true

  validate :ensure_subject_file_limit, on: :create
  validate :ensure_link_matches_type, if: :link?
  validate :ensure_file_belongs_to_organization

  before_create :set_dimensions_on_create
  after_create_commit :enqueue_dimensions_job
  after_commit :broadcast_attachments_stale

  acts_as_list scope: [:subject, :gallery_id], add_new_at: :bottom, top_of_list: 0

  def app_url
    return "" unless subject&.is_a?(Post)

    subject.organization.url + "/posts/#{subject.post.public_id}/preview/#{public_id}"
  end

  def api_type_name
    "Attachment"
  end

  def connected_to_figma?
    figma_file_id.present?
  end

  def remote_figma_url
    return unless connected_to_figma?

    figma_share_url || figma_file.remote_url + "?node-id=#{remote_figma_node_id}"
  end

  def remote_figma_file_key
    figma_file&.remote_file_key
  end

  def image_urls
    return unless image?

    ImageUrls.new(file_path: file_path)
  end

  def self.reorder(id_position_list)
    attachments = Attachment.where(public_id: id_position_list.pluck(:id)).index_by(&:public_id)

    attachment_attrs = id_position_list.map do |pair|
      attachment = attachments[pair[:id]]
      raise ActiveRecord::RecordNotFound unless attachment

      attachment.attributes.merge({ position: pair[:position].to_i })
    end

    Attachment.upsert_all(attachment_attrs)
  end

  def latest_commenters
    self.class.latest_commenters(public_id)
  end

  def self.latest_commenters(public_id)
    # get distinct, active members that have commented on this attachment
    subquery = Comment
      .joins(:attachment, :member)
      .where(attachment: { public_id: public_id }, member: { discarded_at: nil })
      # max the comment id to sort unique members by latest comment
      .select("member.*, MAX(#{Comment.table_name}.id) AS latest_comment_id")
      .group("member.id")

    OrganizationMembership
      .from("(#{subquery.to_sql}) AS #{OrganizationMembership.table_name}")
      .serializer_eager_load
      .order("latest_comment_id DESC")
      .limit(3)
  end

  def url
    return file_path if link?

    build_imgix_url(file_path)
  end

  def extension
    extension = FILE_TYPES_TO_EXTENSION[file_type] || Rack::Mime::MIME_TYPES.invert[file_type] || name&.split(".")&.last || "unknown"
    extension.start_with?(".") ? extension[1..] : extension
  end

  def download_url
    return file_path if link?

    # pass an empty string to download the original file
    # https://docs.imgix.com/apis/rendering/format/download
    build_imgix_url(file_path, dl: "")
  end

  def thumbnail_url
    # checking imgix must come first as imgix videos are also previewable
    if imgix_video?
      imgix_video_thumbnail_urls.thumbnail_url
    elsif previewable?
      resize_preview_url(48)
    elsif gif?
      build_imgix_url(file_path, { w: 48, h: 48, auto: "compress", dpr: 2, frame: 1 })
    elsif image?
      image_urls.thumbnail_url
    end
  end

  def open_graph_image_url
    if previewable?
      build_imgix_url(preview_file_path)
    elsif gif? || image?
      build_imgix_url(file_path)
    end
  end

  def preview_url
    return if link? && !previewable? && !imgix_video?

    if imgix_video?
      return imgix_video_thumbnail_urls.preview_url
    end

    build_imgix_url(preview_file_path)
  end

  def preview_thumbnail_url
    return if link? || (!previewable? && !imgix_video?)

    if imgix_video?
      return imgix_video_thumbnail_urls.thumbnail_url
    end

    ImageUrls.new(file_path: preview_file_path).thumbnail_url
  end

  def resize_preview_url(width)
    if imgix_video?
      return imgix_video_thumbnail_urls.preview_url
    end

    build_imgix_url(preview_file_path, { w: width, auto: "compress", dpr: 2 })
  end

  def link?
    file_path.starts_with?("http")
  end

  def figma?
    !file_path.match(FIGMA_LINK_REGEX).nil?
  end

  def loom?
    !file_path.match(LOOM_LINK_REGEX).nil?
  end

  def gif?
    file_type == "image/gif"
  end

  def image?
    file_type.starts_with?("image") && !gif?
  end

  def audio?
    file_type.starts_with?("audio") || (file_type.starts_with?("video") && no_video_track?)
  end

  def video?
    file_type.starts_with?("video") && !no_video_track?
  end

  def origami?
    file_type.starts_with?("origami")
  end

  def stitch?
    file_type == "stitch"
  end

  def principle?
    file_type.starts_with?("principle")
  end

  def lottie?
    file_type.starts_with?("lottie")
  end

  def heic?
    file_type.ends_with?("heic")
  end

  def previewable?
    preview_file_path.present?
  end

  def imgix_video?
    try(:imgix_video_file_path).present?
  end

  def imgix_video_thumbnail_urls
    return unless imgix_video?

    ImgixVideoThumbnailUrls.new(file_path: imgix_video_file_path)
  end

  def resizable?
    image? && !gif?
  end

  def set_dimensions!
    return if width && height && width > 0 && height > 0

    self.width, self.height = FastImage.size(url)
  end

  def mailer_hero?
    gif? || image? || previewable?
  end

  def export_file_name
    "#{public_id}.#{extension}"
  end

  private

  def set_dimensions_on_create
    return unless image?

    set_dimensions!
  end

  def ensure_link_matches_type
    return if LINK_TYPES.include?(file_type)

    errors.add(:file_path, "does not match known link types")
  end

  def ensure_subject_file_limit
    return unless subject
    return if subject.attachments.count < subject_type.constantize::FILE_LIMIT

    errors.add(subject_type.underscore.to_sym, "can have a max of #{subject_type.constantize::FILE_LIMIT} attachments")
  end

  def ensure_file_belongs_to_organization
    return if link? || subject.nil?

    file_path_prefix_match = file_path.match(%r(^o\/(?<org_public_id>#{PublicIdGenerator::PUBLIC_ID_REGEX})\/p))
    return unless file_path_prefix_match

    file_path_org_public_id = file_path_prefix_match[:org_public_id]
    return unless file_path_org_public_id

    return if file_path_org_public_id == subject.organization.public_id

    errors.add(:file_path, "does not belong to this organization")
  end

  def enqueue_dimensions_job
    return if image? && width && height
    return if video? && width && height && duration
    return if !image? && !video?

    AttachmentDimensionsJob.perform_async(id)
  end

  def broadcast_attachments_stale
    return unless subject&.is_a?(Post)

    subject.broadcast_invalidate

    # DEPRECATED (5/15/24): clients listen to the event from the broadcast_invalidate method
    PusherTriggerJob.perform_async(subject.channel_name, "attachments-stale", { user_id: Current.user&.public_id }.to_json)
  end
end
