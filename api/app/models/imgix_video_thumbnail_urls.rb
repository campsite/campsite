# frozen_string_literal: true

class ImgixVideoThumbnailUrls
  include ImgixUrlBuilder

  def initialize(file_path:)
    raise ArgumentError, "missing file_path" if file_path.blank?

    @file_path = file_path
  end

  attr_reader :file_path

  def thumbnail_url
    build_imgix_video_url(
      file_path,
      {
        "video-generate": "thumbnail",
        "video-thumbnail-time": "1",
        auto: "compress",
        dpr: 2,
        w: ImageUrls::WIDTHS[:thumbnail_url],
      },
    )
  end

  def preview_url
    build_imgix_video_url(
      file_path,
      {
        "video-generate": "thumbnail",
        "video-thumbnail-time": "1",
      },
    )
  end
end
