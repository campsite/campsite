# frozen_string_literal: true

module Campsite
  DEV_APP_URL = URI.parse(ENV.fetch("DEV_APP_URL", "http://app.campsite.test:3000"))
  PROD_DOT_COM_APP_URL = URI.parse("https://app.campsite.com")

  DEV_DESKTOP_APP_PROTOCOL = "campsite-dev://"
  PROD_DESKTOP_APP_PROTOCOL = "campsite://"

  DEV_STYLED_TEXT_API_URL = URI.parse("http://localhost:3002")
  PROD_STYLED_TEXT_API_URL = URI.parse("http://styled-text-server.internal:9000")

  DEV_HTML_TO_IMAGE_URL = URI.parse("http://localhost:9222")
  PROD_HTML_TO_IMAGE_URL = URI.parse("http://html-to-image.internal:9222")

  DEV_MARKETING_SITE_URL = URI.parse("http://localhost:3003")
  PROD_MARKETING_SITE_URL = URI.parse("https://campsite.com")

  BRAND_ORANGE_HEX_CODE = "#f97316"

  def self.base_app_url
    return PROD_DOT_COM_APP_URL if Rails.env.production?

    DEV_APP_URL
  end

  def self.base_marketing_site_url
    return PROD_MARKETING_SITE_URL if Rails.env.production?

    DEV_MARKETING_SITE_URL
  end

  def self.app_url(path:)
    "#{base_app_url}#{path}"
  end

  def self.marketing_site_url(path:)
    "#{base_marketing_site_url}#{path}"
  end

  def self.api_subdomain
    ENV.fetch("API_SUBDOMAIN", "api")
  end

  def self.admin_subdomain
    "admin"
  end

  def self.desktop_app_protocol
    return PROD_DESKTOP_APP_PROTOCOL if Rails.env.production?

    DEV_DESKTOP_APP_PROTOCOL
  end

  def self.desktop_app_url(path:)
    "#{desktop_app_protocol}#{path[1..]}"
  end

  def self.base_styled_text_api_url
    return PROD_STYLED_TEXT_API_URL if Rails.env.production?

    DEV_STYLED_TEXT_API_URL
  end

  def self.base_html_to_image_url
    return PROD_HTML_TO_IMAGE_URL if Rails.env.production?

    DEV_HTML_TO_IMAGE_URL
  end

  def self.user_settings_path
    "/me/settings"
  end

  def self.user_settings_url
    Campsite.app_url(path: user_settings_path)
  end
end
