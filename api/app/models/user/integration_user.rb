# frozen_string_literal: true

class User
  class IntegrationUser < NullUser
    FLIPPER_ID = "IntegrationUser"

    def initialize(integration)
      @integration = integration
    end

    delegate :public_id, :display_name, :avatar_path, to: :integration
    attr_reader :integration

    def avatar_url(size: nil)
      AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).url(size: size)
    end

    def avatar_urls
      AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).urls
    end

    def system?
      false
    end

    def integration?
      true
    end

    def preferred_timezone
      nil
    end
  end
end
