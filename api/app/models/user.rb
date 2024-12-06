# frozen_string_literal: true

require "mail"
require "openssl"

class User < ApplicationRecord
  include FallbackAvatarUrl
  include PublicIdGenerator
  include ImgixUrlBuilder
  include Tokenable

  DEV_APP_PROTOCOL = "campsite-dev://"
  PROD_APP_PROTOCOL = "campsite://"

  DEVISE_OTP_ENTROPY = 32
  PASSWORD_ENTROPY = 32
  NAME_LENGTH = 255
  USERNAME_LENGTH = 30
  # Modified version of Postmark's public regex to ensure domain has a dot
  # https://postmarkapp.com/support/article/1180-what-does-errorcode-300-mean
  EMAIL_REGEX = %r{\A[a-z0-9\.!#\$%&'`\*\+\-/=\^_\{\}\|~]+@((\.)?[a-zA-Z0-9\-])+\.[a-zA-Z0-9\-]+\z}
  RESERVED_NAMES = ["me", "new"].freeze

  SHARED_FEATURE_FLAGS = [
    :slack_auto_publish,
    :sidebar_dms,
    :my_work, # deprecated from client on 11/01/24
    :max_w_chat, # deprecated from client on 11/1/24
    :archive_notifications, # deprecated from client on 10/18/24
    :relative_time,
    :firehose, # deprecated from client on 10/18/24
    :grouped_notifications,
    :comfy_compact_layout,
    :message_email_notifications, # deprecated from client on 10/30/24
    :integration_dms, # deprecated from client on 11/1/24
    :chat_channels,
    :channel_split_view, # deprecated from client on 11/8/24
    :no_emoji_accessories,
    :export,
  ].freeze

  FRONTEND_FEATURES = SHARED_FEATURE_FLAGS + [
    :force_dev_slackbot,
  ].freeze

  validates :name, length: { maximum: NAME_LENGTH }
  validates :email, format: { with: EMAIL_REGEX }
  validates :password, password_strength: { use_dictionary: true, min_word_length: 10 }, allow_nil: true
  validate :email_and_password_should_not_match
  validates :username,
    uniqueness: { case_sensitive: false, message: "is not available." },
    format: {
      with: /\A[a-zA-Z0-9_]*[a-zA-Z0-9]+[a-zA-Z0-9_]*\z/,
      message: "can only contain alphanumeric characters and underscores.",
    },
    length: {
      maximum: USERNAME_LENGTH,
      too_long: "should be less than 30 characters.",
    },
    exclusion: {
      in: RESERVED_NAMES,
      message: "%{value} is reserved.",
    }
  validate :offensive_username
  validate :leaked_password
  validate :timezone_exists

  before_save :downcase_fields
  encrypts :login_token, :otp_secret, deterministic: true

  attr_accessor :initial_time_zone
  attr_writer :unauthenticated_message

  has_many :access_tokens,
    class_name: "Doorkeeper::AccessToken",
    foreign_key: :resource_owner_id,
    dependent: :delete_all
  has_many :oauth_applications, as: :owner, dependent: :delete_all
  has_many :kept_oauth_applications, -> { kept }, class_name: "OauthApplication", as: :owner
  has_many :integrations, dependent: :destroy_async, as: :owner
  has_one :figma_integration, -> { figma }, class_name: "Integration", as: :owner
  has_one :figma_user
  has_many :organization_memberships, dependent: :destroy_async
  has_many :kept_organization_memberships, -> { kept }, class_name: "OrganizationMembership"
  has_many :kept_view_guest_without_shared_project_organization_memberships, -> { kept.with_role_permission(resource: Role::GUEST_WITHOUT_SHARED_PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION) }, class_name: "OrganizationMembership"
  has_many :kept_published_posts, through: :kept_organization_memberships
  has_many :message_threads, through: :kept_organization_memberships
  has_many :unread_inbox_notifications, -> { kept.unarchived.unread.most_recent_per_target_and_member }, through: :kept_organization_memberships, source: :notifications
  has_many :activity_notifications, -> { kept.most_recent_per_target_and_member.activity }, through: :kept_organization_memberships, source: :notifications
  has_many :unread_email_notifications, -> { kept.unread.email }, through: :kept_organization_memberships, source: :notifications
  has_many :message_thread_memberships, through: :kept_organization_memberships
  has_many :unread_message_notifications, -> { unread }, through: :message_thread_memberships, source: :message_notifications
  has_many :organization_invitations, foreign_key: :recipient_id, dependent: :destroy_async
  has_many :organizations, through: :kept_organization_memberships
  has_many :view_guest_without_shared_project_organizations, through: :kept_view_guest_without_shared_project_organization_memberships, source: :organization
  has_many :kept_projects, through: :kept_organization_memberships
  has_many :organization_membership_requests, dependent: :destroy_async
  has_many :requested_organizations, through: :organization_membership_requests, source: :organization
  has_many :scheduled_notifications, as: :schedulable, dependent: :destroy_async
  has_many :subscriptions, class_name: "UserSubscription", dependent: :destroy_async
  has_many :kept_subscribed_notes, -> { kept }, through: :subscriptions, source: :subscribable, source_type: "Note"
  has_many :preferences, class_name: "UserPreference", dependent: :destroy_async
  has_many :web_push_subscriptions, dependent: :destroy_async
  has_many :permissions, dependent: :destroy_async
  has_many :kept_permissions, -> { kept }, class_name: "Permission"
  has_many :active_call_peers, through: :kept_organization_memberships
  has_one :notification_schedule

  scope :not_staff, -> { where(staff: false) }
  scope :confirmed, -> { where.not(confirmed_at: nil) }

  before_validation :set_initial_username, on: :create
  after_create_commit :create_default_schedule
  after_commit :join_verified_domain_organizations, if: -> { saved_change_to_confirmed_at? }, on: [:create, :update]
  after_commit :reindex_posts, if: -> { Searchkick.callbacks? && (saved_change_to_name? || saved_change_to_username?) }, on: [:update]
  after_commit :update_mentions, if: -> { saved_change_to_name? || saved_change_to_username? }, on: [:update]

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :confirmable,
    :doorkeeper,
    :omniauthable,
    :registerable,
    :recoverable,
    :rememberable,
    :two_factor_authenticatable,
    :validatable,
    omniauth_providers: [:google_oauth2, :desktop]

  devise :two_factor_backupable,
    otp_backup_code_length: 20,
    otp_number_of_backup_codes: 10,
    otp_secret_length: 16

  alias_attribute :otp_required_for_login, :otp_enabled

  def self.from_omniauth(access_token)
    found = where(omniauth_provider: access_token.provider, omniauth_uid: access_token.uid).first

    # If no user matching omniauth ID, attempt to add omniauth ID to user with matching email
    found ||= confirmed.where(email: access_token.info.email, omniauth_provider: nil, omniauth_uid: nil).first.tap do |u|
      u&.update!(omniauth_provider: access_token.provider, omniauth_uid: access_token.uid)
    end

    # If no user with matching email, create a new user
    found ||= create do |user|
      user.omniauth_provider = access_token.provider
      user.omniauth_uid = access_token.uid
      user.email = access_token.info.email
      user.name = access_token.info.name
      user.avatar_path = if access_token.info.image && access_token.info.image.length <= 255
        access_token.info.image
      end
      user.password = SecureRandom.hex(PASSWORD_ENTROPY)
      user.skip_confirmation!
    end

    if found.email != access_token.info.email
      found.email = access_token.info.email
      found.confirm if found.skip_confirmation_notification! && found.save
    end

    ImportRemoteUserAvatarJob.perform_async(found.id) if found.avatar_path && found.persisted?
    found
  end

  def self.from_sso(profile:, organization:)
    # existing user who has already authenticated with sso
    existing_profile = find_by(workos_profile_id: profile.id).tap do |user|
      break unless user

      user.name = profile.full_name
      user.save

      organization.join(user: user, confirmed: true, role_name: organization.new_sso_member_role_name)
    end
    return existing_profile if existing_profile

    # existing user authenticating with sso for the first time
    existing_user = find_by(email: profile.email).tap do |user|
      break unless user

      user.name = profile.full_name
      user.workos_profile_id = profile.id
      user.save
      user.skip_confirmation! unless user.confirmed?

      organization.join(user: user, confirmed: true, role_name: organization.new_sso_member_role_name)
    end
    return existing_user if existing_user

    # new user authenticating with sso
    User.new.tap do |user|
      user.email = profile.email
      user.name = profile.full_name
      user.password = SecureRandom.hex(PASSWORD_ENTROPY)
      user.workos_profile_id = profile.id
      user.save
      break user unless user.valid?

      organization.join(user: user, confirmed: true, role_name: organization.new_sso_member_role_name)
      user.skip_confirmation!
    end
  end

  def self.dev_user
    # this should match the user marked as "owner" in packages/demo-content/index.ts
    User.new(
      name: "Ranger Rick",
      email: "ranger.rick@demo.campsite.com",
      password: "CampsiteDesign!",
      password_confirmation: "CampsiteDesign!",
    )
  end

  def self.password_leaked?(pass)
    return false if ::Rails.env.test?

    begin
      password = Pwned::Password.new(pass, headers: { "User-Agent" => "Campsite.co password check" })
      password.pwned?
    rescue Pwned::Error => e
      # log sentry and do nothing if an error was returned while attempting to contact pwned api
      Sentry.capture_exception(e)
      false
    end
  end

  def system?
    false
  end

  def integration?
    false
  end

  def omniauth?
    omniauth_provider.present? && omniauth_uid.present?
  end

  def managed?
    omniauth? || workos_profile?
  end

  def managed_provider
    return "google" if omniauth?

    "sso" if workos_profile?
  end

  def workos_profile?
    workos_profile_id.present?
  end

  def api_type_name
    "User"
  end

  def display_name
    return name if name.present?
    return username if username.present?

    email
  end

  def avatar_url(size: nil)
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).url(size: size)
  end

  def avatar_urls
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).urls
  end

  def remote_avatar?
    return false if avatar_path.blank?

    Addressable::URI.parse(avatar_path).absolute?
  end

  def cover_photo_url
    return if cover_photo_path.blank?

    uri = Addressable::URI.parse(cover_photo_path)
    return uri.to_s if uri.absolute?

    build_imgix_url(cover_photo_path)
  end

  def self.email_domain(email)
    Mail::Address.new(email).domain
  rescue StandardError
    nil
  end

  def email_domain
    self.class.email_domain(email)
  end

  def verified_domain_organizations
    # organizations that have a verified domain matching
    # the users email domain.
    Organization.where(email_domain: email_domain).where.not(id: organizations.pluck(:id))
  end

  def suggested_organizations
    # returns an array that:
    # - includes verified domain organizations
    # - includes organizations which a user has requested membership
    # - does not include the users current orgs
    # - does not include the user current org invitations
    Organization.left_joins(:membership_requests)
      .where("organization_membership_requests.user_id = ? OR email_domain = ?", id, email_domain)
      .where.not(id: organization_memberships.pluck(:organization_id))
      .where.not(id: organization_invitations.pluck(:organization_id))
  end

  def weekly_digest_enabled?
    scheduled_notifications.exists?(name: ScheduledNotification::WEEKLY_DIGEST)
  end

  def onboarded?
    onboarded_at.present?
  end

  def userlist_properties
    {
      name: name,
      post_count: kept_published_posts.size,
    }
  end

  def userlist_identifier
    public_id
  end

  def userlist_push?
    !demo?
  end

  def generate_avatar_presigned_post_fields(mime_type)
    PresignedPostFields.generate(key: generate_avatar_s3_key(mime_type), max_file_size: AvatarUrls::AVATAR_MAX_FILE_SIZE, mime_type: mime_type)
  end

  def generate_avatar_s3_key(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    "u/#{public_id}/a/#{SecureRandom.uuid}#{extension}"
  end

  def generate_cover_photo_presigned_post_fields(mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]

    PresignedPostFields.generate(key: "u/#{public_id}/cp/#{SecureRandom.uuid}#{extension}", max_file_size: AvatarUrls::AVATAR_MAX_FILE_SIZE, mime_type: mime_type)
  end

  def generate_login_token!(sso_id: nil)
    update!(
      login_token: generate_unique_token(attr_name: :login_token),
      login_token_expires_at: 30.minutes.from_now,
      login_token_sso_id: sso_id,
    )
  end

  def reset_login_token!
    update!(login_token: nil, login_token_expires_at: nil)
  end

  def login_token_expired?
    return true unless login_token
    return true unless login_token_expires_at

    Time.current > login_token_expires_at
  end

  def valid_login_token?(token)
    login_token == token
  end

  def desktop_auth_url
    return "#{PROD_APP_PROTOCOL}auth/desktop?email=#{email}&token=#{login_token}" if ::Rails.env.production?

    "#{DEV_APP_PROTOCOL}auth/desktop?email=#{email}&token=#{login_token}"
  end

  def generate_two_factor_secret!
    return if otp_secret

    update!(otp_secret: User.generate_otp_secret)
  end

  def generate_two_factor_backup_codes!
    codes = generate_otp_backup_codes!
    save!
    codes
  end

  def enable_two_factor!
    update(otp_enabled: true)
  end

  def disable_two_factor!
    update!(otp_backup_codes: [], otp_enabled: false, otp_secret: nil)
  end

  def two_factor_provisioning_uri
    issuer = "Campsite"
    label = [issuer, email].join(":")
    "otpauth://totp/#{label}?secret=#{otp_secret}&issuer=#{issuer}"
  end

  def two_factor_backup_codes_generated?
    otp_backup_codes.present?
  end

  def enabled_frontend_features
    Flipper.preload(FRONTEND_FEATURES).select { |feature| feature.enabled?(self) }.map(&:name)
  end

  def find_or_initialize_preference(key)
    preferences.find_or_initialize_by(key: key)
  end

  def email_notifications_enabled?
    find_or_initialize_preference(:email_notifications).value != "disabled"
  end

  def message_email_notifications_enabled?
    find_or_initialize_preference(:message_email_notifications).value != "disabled"
  end

  def unauthenticated_message
    @unauthenticated_message || super
  end

  def channel_name
    "private-user-#{public_id}"
  end

  def unread_notifications_counts_by_org_slug_async
    unread_inbox_notifications
      .joins(:organization)
      .group("organizations.slug")
      .async_count
  end

  def unread_message_counts_by_org_slug_async
    message_thread_memberships
      .unread
      .joins(:message_thread)
      .merge(MessageThread.non_project)
      .joins(organization_membership: :organization)
      .group("organizations.slug")
      .async_count
  end

  def unread_activity_counts_by_org_slug_async
    scope = activity_notifications
    scope.where("notifications.created_at > COALESCE(organization_memberships.activity_last_seen_at, organization_memberships.last_seen_at, ?)", "2024-08-20")
      .or(scope.where(organization_memberships: { activity_last_seen_at: nil }))
      .joins(:organization)
      .group("organizations.slug")
      .async_count
  end

  def unread_home_inbox_counts_by_org_slug_async
    unread_inbox_notifications
      .home_inbox
      .joins(:organization)
      .group("organizations.slug")
      .async_count
  end

  def unread_notifications_count
    inbox = unread_home_inbox_counts_by_org_slug_async
    messages = unread_message_counts_by_org_slug_async

    inbox.value.values.sum + messages.value.values.sum
  end

  def slack_user_ids
    kept_organization_memberships.map { |membership| membership.slack_user_id }.flatten.compact.uniq
  end

  def on_call?
    active_call_peers.any?
  end

  def trigger_current_user_stale
    PusherTriggerJob.perform_async(
      channel_name,
      "current-user-stale",
      { current_user: CurrentUserSerializer.render_as_hash(self) }.to_json,
    )
  end

  def google_calendar_organization
    if google_calendar_organization_id
      organization = organizations.find_by(id: google_calendar_organization_id)
      return organization if organization

      update!(google_calendar_organization_id: nil)
    end

    likely_primary_work_organization
  end

  def installed_google_calendar_integration?
    access_tokens.joins(:application).where(application: { provider: :google_calendar }).any?
  end

  def cal_dot_com_organization
    preferred_cal_dot_com_organization || likely_primary_work_organization
  end

  def installed_cal_dot_com_integration?
    access_tokens.joins(:application).where(application: { provider: :cal_dot_com }).any?
  end

  def notifications_paused?
    notification_pause_expires_at.present? && notification_pause_expires_at.after?(Time.current)
  end

  def pause_notifications!(expires_at:)
    update!(notifications_paused_at: Time.current, notification_pause_expires_at: expires_at)
    BroadcastUserStaleJob.perform_async(id)
    BroadcastUserStaleJob.perform_at(expires_at, id)
  end

  def unpause_notifications!
    update!(notifications_paused_at: nil, notification_pause_expires_at: nil)
    BroadcastUserStaleJob.perform_async(id)
  end

  private

  def reindex_posts
    kept_published_posts.reindex(mode: :async)
  end

  def update_mentions
    UpdateMentionUsernamesJob.perform_async(id)
  end

  def email_and_password_should_not_match
    if email.present? && password.present? && email == password
      errors.add(:password, "cannot match email")
    end
  end

  def offensive_username
    return if username.blank?

    # Swearjar splits on spaces in some matches
    spaced_username = username.gsub(/(-|_)+/, " ")
    swearjar = Swearjar.new(::Rails.root.join("config/locales/swearjar.yml"))
    if swearjar.profane?(spaced_username)
      errors.add(:username, "may contain offensive language")
    end
  end

  def leaked_password
    return if password.nil?

    if self.class.password_leaked?(password)
      errors.add(:password, "has been leaked. This password was found in a data breach and can't be used.")
    end
  end

  def set_initial_username
    return if username
    return unless email
    return unless errors.empty?

    address = Mail::Address.new(email)
    potential = address.local.first(USERNAME_LENGTH)
    potential *= 2 if potential.length == 1
    potential = potential.downcase.parameterize.underscore

    # alternative email + [num]
    alts = Array.new(100) { |ix| format("%s%s", potential.first(USERNAME_LENGTH - 2), ix + 1) }
    candidates = [potential] + alts
    used = User.where(username: candidates).pluck(:username)
    available = candidates - used - RESERVED_NAMES

    self.username = available.first
  rescue Mail::Field::IncompleteParseError
    errors.add(:email, "is invalid")
  end

  def create_default_schedule
    scheduled_notifications.create(
      name: ScheduledNotification::WEEKLY_DIGEST,
      delivery_day: "friday",
      delivery_time: "5:00 pm",
      time_zone: initial_time_zone || "America/Los_Angeles",
    )

    scheduled_notifications.create(
      name: ScheduledNotification::DAILY_DIGEST,
      delivery_time: "9:00 am",
      time_zone: initial_time_zone || "America/Los_Angeles",
    )
  end

  def downcase_fields
    username&.downcase!
  end

  def join_verified_domain_organizations
    return if workos_profile?

    verified_domain_organizations.each do |organization|
      organization.join(user: self, role_name: Role::MEMBER_NAME, notify_admins_source: :verified_domain)
    end
  end

  def likely_primary_work_organization
    return verified_domain_organizations.first if verified_domain_organizations.any?

    matching_billing_email_domain_organization = organizations.where("billing_email LIKE ?", "%#{email_domain}").first
    return matching_billing_email_domain_organization if matching_billing_email_domain_organization

    organizations.first!
  end

  def preferred_cal_dot_com_organization
    preference = find_or_initialize_preference(:cal_dot_com_organization_id)
    return unless preference.persisted?

    organization = organizations.find_by(id: preference.value.to_i)

    return organization if organization

    preference.destroy!
    nil
  end

  def timezone_exists
    return unless preferred_timezone
    return if TZInfo::Timezone.all_identifiers.include?(preferred_timezone)

    errors.add(:preferred_timezone, "does not exist")
  end
end
