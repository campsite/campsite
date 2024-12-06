# frozen_string_literal: true

class ImageUrls
  include ImgixUrlBuilder

  WIDTHS = {
    thumbnail_url: 112,
    email_url: 600,
    feed_url: 800,
    slack_url: 1200,
    large_url: 1440,
  }.freeze

  def initialize(file_path:)
    raise ArgumentError, "missing file_path" if file_path.blank?

    @file_path = file_path
  end

  attr_reader :file_path

  def original_url
    return file_path if blob? || data?

    build_imgix_url(file_path)
  end

  def thumbnail_url
    return file_path if blob? || data?

    build_imgix_url(file_path, { auto: "compress,format", dpr: 2, w: WIDTHS[:thumbnail_url], q: 60 })
  end

  def email_url
    return file_path if blob? || data?

    build_imgix_url(file_path, { auto: "compress,format", dpr: 2, w: WIDTHS[:email_url] })
  end

  def feed_url
    return file_path if blob? || data?

    build_imgix_url(file_path, { auto: "compress,format", dpr: 2, w: WIDTHS[:feed_url], q: 80 })
  end

  def slack_url
    return file_path if blob? || data?

    build_imgix_url(file_path, { auto: "compress,format", dpr: 2, w: WIDTHS[:slack_url], q: 75 })
  end

  def large_url
    return file_path if blob? || data?

    build_imgix_url(file_path, { auto: "compress,format", dpr: 2, w: WIDTHS[:large_url], q: 90 })
  end

  private

  def blob?
    return @blob if defined?(@blob)

    @blob = file_path.starts_with?("blob:")
  end

  def data?
    return @data if defined?(@data)

    @data = file_path.starts_with?("data:")
  end
end
