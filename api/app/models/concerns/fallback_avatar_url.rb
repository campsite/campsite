# frozen_string_literal: true

require "nanoid"

module FallbackAvatarUrl
  extend ActiveSupport::Concern

  def fallback_avatar_url
    uri = Campsite.base_app_url.clone
    uri.path = "/img/avatar-fallback.png"
    uri.to_s
  end
end
