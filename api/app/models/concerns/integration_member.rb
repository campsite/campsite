# frozen_string_literal: true

# Contains methods that allow integration models like Integration
# or OauthApplication to be serialized using OrganizationMemberSerializer.
module IntegrationMember
  def user
    User::IntegrationUser.new(self)
  end

  def latest_active_status
    nil
  end

  def url
    nil
  end

  def role_name
    Role::MEMBER_NAME
  end

  def integration?
    true
  end

  def deactivated?
    false
  end
end
