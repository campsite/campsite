# frozen_string_literal: true

class OrganizationMembership
  class NullOrganizationMembership
    def initialize(**attrs)
      @user = attrs[:user]
      @display_name = attrs[:display_name]
      @system = ActiveModel::Type::Boolean.new.cast(attrs[:system])
    end

    delegate :username, :display_name, :avatar_url, :avatar_urls, to: :user

    def public_id
      ""
    end

    def role_name
      Role::MEMBER_NAME
    end

    def created_at
      ""
    end

    def deactivated?
      false
    end

    def integration?
      false
    end

    def user
      @user || User::NullUser.new(display_name: @display_name, system: @system)
    end

    def latest_active_status
      nil
    end

    def url
      nil
    end
  end
end
