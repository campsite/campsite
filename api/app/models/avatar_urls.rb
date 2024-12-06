# frozen_string_literal: true

class AvatarUrls
  include ImgixUrlBuilder

  AVATAR_MAX_FILE_SIZE = 5.megabyte

  def initialize(avatar_path: nil, display_name: nil)
    @avatar_path = avatar_path
    @display_name = display_name
  end

  def url(size: nil)
    # retina scale images
    size = size.nil? ? nil : size * 2

    if @avatar_path.blank?
      return fallback_avatar(@display_name, {
        "w": size,
        "h": size,
        "fit": "crop",
      })
    end

    return @avatar_path if remote?

    build_imgix_url(@avatar_path, {
      "w": size,
      "h": size,
      "fit": "crop",
    })
  end

  def urls
    {
      xs: url(size: 20),
      sm: url(size: 24),
      base: url(size: 32),
      lg: url(size: 40),
      xl: url(size: 64),
      xxl: url(size: 112),
    }
  end

  def remote?
    return false if @avatar_path.blank?

    Addressable::URI.parse(@avatar_path).absolute?
  end
end
