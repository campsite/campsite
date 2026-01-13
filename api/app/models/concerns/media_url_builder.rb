# frozen_string_literal: true

require "nanoid"

module MediaUrlBuilder
  extend ActiveSupport::Concern

  FALLBACK_AVATAR_COLORS = [
    "3b82f6", # blue.500
    "4ade80", # green.400
    "fde047", # yellow.300
    "ef4444", # red.500
    "9333ea", # purple.300
    "ec4899", # pink.500
    "6366f1", # indigo.500
    "5eead4", # teal.300
  ].freeze

  def cdn_provider
    # Check credentials to determine which CDN provider is configured
    media_provider = Rails.application.credentials.dig(:media, :provider)

    @cdn_provider ||= if media_provider == "cloudflare"
      :cloudflare
    elsif media_provider == "imgix"
      :imgix
    else
      :cloudflare # default
    end
  end

  def fallback_avatar(name = "", append_params = {})
    color = FALLBACK_AVATAR_COLORS[name.each_byte.sum % FALLBACK_AVATAR_COLORS.length]
    build_media_url(
      "static/avatars/#{name[0] ? name[0].upcase : "blank"}.png",
      append_params.merge("blend-color": color),
    )
  end

  # Main URL builder - delegates to appropriate CDN
  def build_media_url(path, append_params = {})
    case cdn_provider
    when :imgix
      build_imgix_cdn_url(path, append_params)
    when :cloudflare
      build_cloudflare_cdn_url(path, append_params)
    end
  end

  def build_media_folder_url(path, append_params = {})
    case cdn_provider
    when :imgix
      build_imgix_cdn_folder_url(path, append_params)
    when :cloudflare
      build_cloudflare_cdn_url(path, append_params, url_key: :folder_cdn_url)
    end
  end

  def build_media_video_url(path, append_params = {})
    case cdn_provider
    when :imgix
      build_imgix_cdn_video_url(path, append_params)
    when :cloudflare
      build_cloudflare_cdn_url(path, append_params, url_key: :video_cdn_url)
    end
  end

  private

  # === Imgix-specific methods ===

  def build_imgix_cdn_url(path, append_params = {})
    uri = Addressable::URI.parse(Rails.application.credentials.dig(:imgix, :url))
    uri.path = path

    if append_params.present?
      uri.query_values = append_params.compact.merge(uri.query_values || {})
    end

    uri.to_s
  end

  def build_imgix_cdn_folder_url(path, append_params = {})
    folder_url = Rails.application.credentials.dig(:imgix_folder, :url) || Rails.application.credentials.dig(:imgix, :url)

    uri = Addressable::URI.parse(folder_url)
    uri.path = path

    if append_params.present?
      uri.query_values = append_params.compact.merge(uri.query_values || {})
    end

    uri.to_s
  end

  def build_imgix_cdn_video_url(path, append_params = {})
    video_url = Rails.application.credentials.dig(:imgix_video, :url) || Rails.application.credentials.dig(:imgix, :url)

    uri = Addressable::URI.parse(video_url)
    uri.path = path

    if append_params.present?
      uri.query_values = append_params.compact.merge(uri.query_values || {})
    end

    uri.to_s
  end

  # === Cloudflare-specific methods ===

  def build_cloudflare_cdn_url(path, append_params = {}, url_key: :cdn_url)
    return if path.nil?

    cdn_url = Rails.application.credentials.dig(:cloudflare, url_key)
    # Fallback to main cdn_url if specific URL is not configured
    cdn_url ||= Rails.application.credentials.dig(:cloudflare, :cdn_url)

    uri = Addressable::URI.parse(cdn_url)
    uri.path = "/cdn/#{path.sub(%r{^/}, "")}"

    if append_params.present?
      uri.query_values = append_params.compact.merge(uri.query_values || {})
    end

    uri.to_s
  end
end
