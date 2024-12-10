# frozen_string_literal: true

require "swearjar"

class Organization < ApplicationRecord
  extend FriendlyId
  include FallbackAvatarUrl
  include PublicIdGenerator
  include ImgixUrlBuilder
  include Tokenable

  COVER_PHOTO_MAX_FILE_SIZE = 5.megabyte
  SLUG_MAX_LENGTH = 32
  TRIAL_DURATION = 14.days

  RESERVED_NAMES = ["admin", "auth", "desktop", "invitations", "me", "new", "people", "settings", "sso"].freeze
  FEATURE_FLAGS = User::SHARED_FEATURE_FLAGS + [
    Plan::SSO_FEATURE,
    :api_endpoint_list_members, # deprecated on 10/21/24
    :api_endpoint_list_posts, # deprecated on 10/14/24
    :multi_org_apps,
  ]
  ACTIVE_SUBSCRIPTION_STATUSES = ["active", "past_due", "trialing", "unpaid"].freeze

  class MultiplePlanItemsError < StandardError; end

  has_many :oauth_applications, dependent: :destroy_async, as: :owner
  has_many :kept_oauth_applications, -> { kept }, class_name: "OauthApplication", as: :owner
  has_many :integrations, dependent: :destroy_async, as: :owner
  has_one  :slack_integration, -> { where(provider: :slack) }, class_name: "Integration", as: :owner
  has_one  :linear_integration, -> { where(provider: :linear) }, class_name: "Integration", as: :owner
  has_one  :campsite_integration, -> { where(provider: :campsite) }, class_name: "Integration", as: :owner
  has_many :slack_channels, through: :slack_integration, source: :channels
  has_many :invitations, class_name: "OrganizationInvitation", dependent: :destroy_async
  has_many :invited_members, through: :invitations, source: :recipient
  has_many :memberships, class_name: "OrganizationMembership", dependent: :destroy_async
  has_many :kept_memberships, -> { kept }, class_name: "OrganizationMembership"
  has_many :kept_non_guest_memberships, -> { kept.non_guest }, class_name: "OrganizationMembership"
  has_many :discarded_memberships, -> { discarded }, class_name: "OrganizationMembership"
  has_many :role_counted_memberships, -> { kept.role_counted }, class_name: "OrganizationMembership"
  has_many :members, through: :kept_memberships, source: :user
  has_many :non_guest_members, through: :kept_non_guest_memberships, source: :user
  has_many :membership_requests, class_name: "OrganizationMembershipRequest", dependent: :destroy_async
  has_many :membership_request_users, through: :membership_requests, source: :user
  has_many :figma_integrations, through: :members, source: :figma_integration
  has_many :projects, dependent: :destroy_async
  has_one  :general_project, -> { where(is_general: true) }, class_name: "Project"
  has_many :tags, dependent: :destroy_async
  has_many :posts, dependent: :destroy_async
  has_many :kept_posts, -> { kept }, class_name: "Post"
  has_many :kept_published_posts, -> { kept.with_published_state }, class_name: "Post"
  has_many :post_subscriptions, through: :posts, source: :subscriptions
  has_many :settings, class_name: "OrganizationSetting", dependent: :destroy_async
  has_many :sso_domains, class_name: "OrganizationSsoDomain", dependent: :destroy_async
  has_many :post_digests, dependent: :destroy_async
  has_many :kept_post_digests, -> { kept }, class_name: "PostDigest"
  has_many :notes, through: :memberships, source: :notes
  has_many :call_rooms, dependent: :destroy_async
  has_many :calls, through: :call_rooms
  has_many :custom_reactions, dependent: :destroy_async
  has_many :access_tokens,
    class_name: "Doorkeeper::AccessToken",
    foreign_key: :resource_owner_id,
    dependent: :delete_all
  has_many :webhooks, through: :oauth_applications
  has_many :active_webhooks, -> { enabled }, through: :oauth_applications, source: :webhooks

  has_many :admin_memberships,
    -> { where(role_name: Role::ADMIN_NAME).kept },
    class_name: "OrganizationMembership"
  has_many :admins, through: :admin_memberships, source: :user

  belongs_to :creator, class_name: "User"

  delegate :limits, :true_up_annual_subscriptions?, to: :plan

  friendly_id :slug, use: :history, dependent: :destroy

  validates :name, presence: true

  validates :slug,
    presence: true,
    uniqueness: { case_sensitive: false, message: "is not available." },
    format: {
      with: /\A[a-z0-9][a-z0-9-]*[a-z0-9]\z/,
      message: "can only contain lowercase alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
    },
    length: {
      maximum: SLUG_MAX_LENGTH,
      too_long: "should be less than #{SLUG_MAX_LENGTH} characters.",
    }

  validates :billing_email, format: { with: User::EMAIL_REGEX }, allow_nil: true

  validates :plan_name, inclusion: { in: Plan::NAMES }

  validate :valid_domain
  validate :reserved_slug
  validate :offensive_slug

  validates :invite_token, presence: true, uniqueness: true
  encrypts :invite_token, deterministic: true

  before_validation :set_tokenable

  def tokenable_attribute
    :invite_token
  end

  def email_domain_matches?(actor, domain = email_domain)
    actor_domain = Mail::Address.new(actor.email).domain
    actor_domain == domain
  end

  def self.create_organization(creator:, name:, slug:, avatar_path: nil, demo: false, role: nil, org_size: nil, source: nil, why: nil)
    Organization::CreateOrganization.new(
      creator: creator,
      name: name,
      slug: slug,
      avatar_path: avatar_path,
      demo: demo,
      role: role,
      org_size: org_size,
      source: source,
      why: why,
    ).run
  end

  def self.with_slack_team_id(team_id)
    joins(slack_integration: :data).where(
      slack_integration: {
        integration_data: { name: "team_id", value: team_id },
      },
    )
  end

  def invite_members(sender:, invitations:)
    Organization::InviteMembers.new(organization: self, sender: sender, invitations: invitations).run
  end

  def bulk_invite_members(sender:, comma_separated_emails:, project_id: nil)
    invitations = comma_separated_emails.gsub(/\n+/, ",").split(",").map do |email|
      {
        email: email.strip,
        role: Role::MEMBER_NAME,
        project_ids: [project_id].compact,
      }
    end
    Organization::InviteMembers.new(
      organization: self,
      sender: sender,
      invitations: invitations,
    ).run
  end

  def remove_member(membership)
    Organization::RemoveMember.new(organization: self, membership: membership).run
  end

  def admin?(user)
    admins.include?(user)
  end

  def member?(user)
    return user.organizations.include?(self) if user&.organizations&.loaded?

    members.include?(user)
  end

  def api_type_name
    "Organization"
  end

  def paid?
    plan_name != Plan::FREE_NAME
  end

  def trial_ended?
    !paid? && trial_ends_at.present? && Time.current.after?(trial_ends_at)
  end

  def trial_active?
    !paid? && trial_ends_at.present? && Time.current.before?(trial_ends_at)
  end

  def trial_days_remaining
    return unless trial_active?

    (trial_ends_at.to_date - Date.current).to_i
  end

  def create_campsite_integration
    unless campsite_integration
      self.campsite_integration = integrations.create!(provider: :campsite, creator: creator)
    end
  end

  def avatar_url(size: nil)
    AvatarUrls.new(avatar_path: avatar_path, display_name: name).url(size: size)
  end

  def avatar_urls
    AvatarUrls.new(avatar_path: avatar_path, display_name: name).urls
  end

  def reset_invite_token!
    self.invite_token = generate_unique_token(attr_name: :invite_token)
    save!
  end

  def invitation_url
    "#{Campsite.base_app_url}/join/#{invite_token}"
  end

  def path
    "/#{slug}"
  end

  def url
    Campsite.app_url(path: path)
  end

  def settings_path
    "/#{slug}/settings"
  end

  def settings_url
    Campsite.app_url(path: settings_path)
  end

  def billing_settings_url
    "#{Campsite.base_app_url}/#{slug}/settings/billing"
  end

  def members_settings_url
    "#{Campsite.base_app_url}/#{slug}/people"
  end

  def members_base_url
    "#{Campsite.base_app_url}/#{slug}/people"
  end

  def projects_base_url
    "#{Campsite.base_app_url}/#{slug}/projects"
  end

  def member_url(user)
    "#{members_base_url}#{user.username}"
  end

  def create_membership!(user:, role_name:, projects: [], inviting_member: nil)
    # add user to org as a member
    membership = memberships.find_or_initialize_by(user: user)
    membership.update!(role_name: role_name, discarded_at: nil)

    if projects.any?
      user.permissions.create!(projects.map { |project| { subject: project, action: :view, event_actor: inviting_member } })
      projects.each { |project| project.add_member!(membership, event_actor: inviting_member) }
    end

    if membership.role.join_default_projects?
      membership.join_default_projects!
      membership.favorite_default_projects!
    end

    # destroy any pending requests
    membership_requests.where(user: user).destroy_all
    # destroy any pending invitations
    invitations.where(email: user.email).destroy_all

    membership
  end

  def requested_membership?(user)
    membership_request_users.include?(user)
  end

  def join(user:, confirmed: false, role_name: Role::VIEWER_NAME, notify_admins_source: nil)
    return if member?(user)

    if confirmed || email_domain_matches?(user)
      if (invitation = invitations.find_by(email: user.email))
        role_name = invitation.role
      end

      member = create_membership!(user: user, role_name: role_name)

      if notify_admins_source
        admins.each do |admin|
          case notify_admins_source
          when :link
            OrganizationMailer.join_via_link(member, admin).deliver_later
          when :verified_domain
            OrganizationMailer.join_via_verified_domain(member, admin).deliver_later
          end
        end
      end

      member
    elsif !requested_membership?(user)
      membership_requests.create!(user: user)
    end
  end

  def slack_token
    slack_integration&.token
  end

  def update_slack_channel!(id:, is_private:)
    return if slack_channel_id == id

    self.slack_channel_id = id

    return unless slack_token
    return unless id
    return if is_private

    slack_client.conversations_join(channel: id)
  end

  def has_linear_integration?
    linear_integration.present?
  end

  def has_zapier_integration?
    access_tokens.joins(:application).exists?(oauth_applications: { provider: :zapier })
  end

  def userlist_identifier
    public_id
  end

  def userlist_properties
    {
      name: name,
      members_count: memberships.size,
      plan: plan_name,
      slug: slug,
    }
  end

  def userlist_push?
    !demo?
  end

  def post_file_key_prefix
    "o/#{public_id}/p/"
  end

  def generate_post_presigned_post_fields(mime_type)
    PresignedPostFields.generate(key: generate_post_s3_key(mime_type), max_file_size: file_size_bytes_limit, mime_type: mime_type)
  end

  def generate_post_s3_key(mime_type)
    extension = if mime_type == "origami"
      ".origami"
    elsif mime_type == "principle"
      ".prd"
    elsif mime_type == "lottie"
      ".json"
    elsif mime_type == "video/mp4"
      # prevent default rack mime type of "mp4v"
      ".mp4"
    else
      Rack::Mime::MIME_TYPES.invert[mime_type]
    end

    "#{post_file_key_prefix}#{SecureRandom.uuid}#{extension}"
  end

  def generate_avatar_s3_key(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    "o/#{public_id}/a/#{SecureRandom.uuid}#{extension}"
  end

  def generate_avatar_presigned_post_fields(mime_type)
    PresignedPostFields.generate(key: generate_avatar_s3_key(mime_type), max_file_size: AvatarUrls::AVATAR_MAX_FILE_SIZE, mime_type: mime_type)
  end

  def generate_project_presigned_post_fields(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    PresignedPostFields.generate(key: "o/#{public_id}/prj/cp/#{SecureRandom.uuid}#{extension}", max_file_size: COVER_PHOTO_MAX_FILE_SIZE, mime_type: mime_type)
  end

  def generate_message_thread_presigned_post_fields(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    PresignedPostFields.generate(key: "o/#{public_id}/mt/#{SecureRandom.uuid}#{extension}", max_file_size: file_size_bytes_limit, mime_type: mime_type)
  end

  def generate_oauth_application_presigned_post_fields(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    PresignedPostFields.generate(key: "o/#{public_id}/oa/#{SecureRandom.uuid}#{extension}", max_file_size: file_size_bytes_limit, mime_type: mime_type)
  end

  def slack_client
    @slack_client ||= Slack::Web::Client.new(token: slack_token)
  end

  def update_setting(key, value)
    setting = settings.find_or_initialize_by(key: key)
    setting.update(value: value)
    setting
  end

  has_one :enforce_two_factor_authentication_setting, -> { where(key: "enforce_two_factor_authentication") }, class_name: "OrganizationSetting"
  has_one :enforce_sso_authentication_setting, -> { where(key: "enforce_sso_authentication") }, class_name: "OrganizationSetting"
  has_one :new_sso_member_role_name_setting, -> { where(key: OrganizationSetting::NEW_SSO_MEMBER_ROLE_NAME_KEY) }, class_name: "OrganizationSetting"

  def enforce_two_factor_authentication?
    enforce_two_factor_authentication_setting&.value == "1"
  end

  def enforce_sso_authentication?
    enforce_sso_authentication_setting&.value == "1"
  end

  def new_sso_member_role_name
    new_sso_member_role_name_setting&.value || Role::MEMBER_NAME
  end

  def workos_organization?
    workos_organization_id.present?
  end

  def enable_sso!(domains:)
    return if workos_organization?

    ActiveRecord::Base.transaction do
      domains.each { |domain| sso_domains.create!(domain: domain) }
      workos_org = WorkOS::Organizations.create_organization(name: name, domains: domains)
      update!(workos_organization_id: workos_org.id)
    end
  end

  def disable_sso!
    return unless workos_organization?

    transaction do
      WorkOS::Organizations.delete_organization(id: workos_organization_id)
      update!(workos_organization_id: nil)
      sso_domains.destroy_all
      update_setting(:enforce_sso_authentication, false)
    end
  end

  def sso_portal_url
    return unless workos_organization?

    WorkOS::Portal.generate_link(organization: workos_organization_id, intent: "sso")
  end

  def sso_connection
    return unless workos_organization?

    connections = WorkOS::SSO.list_connections
    connections.data.find { |c| c.state == "active" && c.organization_id == workos_organization_id }
  end

  def features
    (Flipper.preload(FEATURE_FLAGS).select { |feature| feature.enabled?(self) }.map(&:name) + plan.features).uniq
  end

  def plan
    Plan.by_name!(plan_name)
  end

  def file_size_bytes_limit
    limits[Plan::FILE_SIZE_BYTES_LIMIT] || 1.gigabyte
  end

  def channel_name
    "organization-#{slug}"
  end

  def presence_channel_name
    "presence-#{channel_name}"
  end

  private

  def valid_domain
    return if email_domain.blank?
    return unless email_domain_changed?

    unless PublicSuffix.valid?(email_domain)
      return errors.add(:email_domain, "is invalid.")
    end

    if EmailProviderDomains.include?(email_domain)
      errors.add(:email_domain, "is not supported.")
    end
  end

  def reserved_slug
    return unless slug

    if RESERVED_NAMES.include?(slug)
      errors.add(:slug, "is a reserved word")
    end
  end

  def offensive_slug
    return unless slug

    # Swearjar splits on spaces in some matches
    spaced_slug = slug.gsub(/(-|_)+/, " ")
    swearjar = Swearjar.new(::Rails.root.join("config/locales/swearjar.yml"))
    if swearjar.profane?(spaced_slug)
      errors.add(:slug, "may contain offensive language")
    end
  end
end
