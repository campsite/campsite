# frozen_string_literal: true

class User
  class NullUser
    FLIPPER_ID = "NullUser"

    def initialize(**attrs)
      @display_name = attrs[:display_name] || ""
      @system = !!ActiveModel::Type::Boolean.new.cast(attrs[:system])
    end

    attr_accessor :display_name

    def public_id
      ""
    end

    def avatar_url(size: nil)
      ""
    end

    def avatar_urls
      AvatarUrls.new(display_name: display_name).urls
    end

    def cover_photo_url
      nil
    end

    def email
      ""
    end

    def username
      ""
    end

    def onboarded_at
      ""
    end

    def channel_name
      ""
    end

    def unconfirmed_email
      ""
    end

    def confirmed?
      false
    end

    def managed?
      false
    end

    def otp_enabled?
      nil
    end

    def staff?
      false
    end

    def system?
      @system
    end

    def integration?
      false
    end

    def on_call?
      false
    end

    def notifications_paused?
      false
    end

    def notification_pause_expires_at
      nil
    end

    def enabled_frontend_features
      Flipper.preload(FRONTEND_FEATURES).select { |feature| feature.enabled?(self) }.map(&:name)
    end

    def flipper_id
      FLIPPER_ID
    end

    def preferences
      []
    end

    def created_at
      nil
    end

    def preferred_timezone
      nil
    end

    def export_json
      nil
    end
  end
end
