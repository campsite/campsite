# frozen_string_literal: true

class OpenGraphLink < ApplicationRecord
  include ImgixUrlBuilder

  class ParseError < StandardError; end

  validates :url, presence: true, uniqueness: true
  validates :title, presence: true

  def generate_image_s3_key(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    "og/#{url.parameterize}/img/#{SecureRandom.uuid}#{extension}"
  end

  def image_url
    build_imgix_url(image_path) if image_path.present?
  end

  def favicon_url
    build_imgix_url(favicon_path) if favicon_path.present?
  end

  def self.normalize_url(url)
    uri = URI.parse(url)

    host = uri.host
    return if host.blank? || host == "localhost" || host == "127.0.0.1"

    path = uri.path
    path.gsub!(%r{/$}, "") # remove trailing slash

    "https://#{host.downcase}#{path}"
  rescue URI::InvalidURIError
    nil
  end

  def self.safe_remote_url(url)
    if url.present? && (uri = URI.parse(url)).host.present?
      uri
    end
  rescue URI::InvalidURIError
    nil
  end

  def self.find_or_create_by_url!(url)
    normalized_url = normalize_url(url)
    raise ParseError if normalized_url.nil?

    link = OpenGraphLink.find_by(url: normalized_url)
    return link if link.present?

    page = MetaInspector.new(normalized_url)
    # Raise error if status is within 4xx or 5xx range
    raise ParseError if page.response.status >= 400

    link = OpenGraphLink.new(url: normalized_url, title: page.best_title)

    remote_image_url = safe_remote_url(page.meta["twitter:image"] || page.meta["og:image"])
    if remote_image_url.present?
      tempfile = Down.download(remote_image_url, max_size: AvatarUrls::AVATAR_MAX_FILE_SIZE)
      image_path = link.generate_image_s3_key(tempfile.content_type)
      object = S3_BUCKET.object(image_path)
      object.put(body: tempfile)
      link.image_path = image_path
    end

    favicon_url = safe_remote_url(page.images.favicon)
    if favicon_url.present?
      tempfile = Down.download(favicon_url, max_size: AvatarUrls::AVATAR_MAX_FILE_SIZE)
      image_path = link.generate_image_s3_key(tempfile.content_type)
      object = S3_BUCKET.object(image_path)
      object.put(body: tempfile)
      link.favicon_path = image_path
    end

    link.save!
    link
  rescue MetaInspector::Error, Down::Error
    raise ParseError
  end
end
