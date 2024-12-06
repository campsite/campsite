# frozen_string_literal: true

class ApiActor
  delegate :resource_owner_id, to: :access_token, allow_nil: true
  delegate :owner, to: :application, allow_nil: true

  delegate :owned_by_organization?, :owned_by_user?, to: :access_token, allow_nil: true, prefix: true
  delegate :owned_by_organization?, :owned_by_user?, to: :oauth_application, allow_nil: true, prefix: true

  attr_reader :access_token, :oauth_application, :org_slug, :user

  def initialize(access_token: nil, oauth_application: nil, org_slug: nil, user: nil)
    @access_token = access_token
    @oauth_application = oauth_application
    @org_slug = org_slug
    @user = user || user_token_owner
  end

  # The actor is an organization if:
  # - The access token is an org-scoped token
  # - The class is initialized with an OauthApplication that is owned by an organization
  def organization_scope?
    !!(access_token_owned_by_organization? || oauth_application_owned_by_organization?)
  end

  def organization
    return unless access_token || oauth_application

    return @organization if defined?(@organization)

    @organization =
      if oauth_application_owned_by_organization?
        oauth_application.owner
      elsif access_token_owned_by_organization?
        Organization.find_by(id: resource_owner_id)
      elsif access_token_owned_by_user? && org_slug.present?
        organization = Organization.find_by(slug: org_slug)
        organization if organization && user.kept_organization_memberships.exists?(organization: organization)
      end
  end

  def organization_membership
    return @organization_membership if defined?(@organization_membership)

    return unless user

    @organization_membership = user.kept_organization_memberships.find_by(organization: organization)
  end

  def application
    access_token&.application || oauth_application
  end

  def confirmed?
    user&.confirmed? || application&.kept?
  end

  private

  def user_token_owner
    return @user_token_owner if defined?(@user_token_owner)

    return unless access_token_owned_by_user? || oauth_application_owned_by_user?

    @user_token_owner ||= User.find(user_id)
  end

  def user_id
    return resource_owner_id if access_token_owned_by_user?

    oauth_application.owner_id if oauth_application_owned_by_user?
  end
end
