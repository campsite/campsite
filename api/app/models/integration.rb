# frozen_string_literal: true

class Integration < ApplicationRecord
  include PublicIdGenerator
  include IntegrationMember

  PROVIDERS = {
    campsite: {
      display_name: "Campsite",
      avatar_path: "static/avatars/service-campsite-v2.png",
    },
    slack: {
      display_name: "Slack",
      avatar_path: "static/avatars/service-slack.png",
    },
    figma: {
      display_name: "Figma",
      avatar_path: "static/avatars/service-figma.png",
    },
    linear: {
      display_name: "Linear",
      avatar_path: "static/avatars/service-linear.png",
    },
    zapier: {
      display_name: "Zapier",
      avatar_path: "static/avatars/service-zapier.png",
    },
  }.freeze

  scope :campsite, -> { where(provider: :campsite) }
  scope :slack, -> { where(provider: :slack) }
  scope :figma, -> { where(provider: :figma) }
  scope :linear, -> { where(provider: :linear) }
  scope :zapier, -> { where(provider: :zapier) }

  belongs_to :creator, class_name: "User"
  belongs_to :owner, polymorphic: true
  has_many :integration_organization_memberships, dependent: :destroy_async

  has_many :data, class_name: "IntegrationData", dependent: :destroy_async
  has_many :channels, class_name: "IntegrationChannel", dependent: :destroy_async
  has_many :teams, class_name: "IntegrationTeam", dependent: :destroy_async

  before_validation :generate_token, on: :create

  validates :provider, :token, presence: true
  validates :provider, inclusion: { in: PROVIDERS.keys.map(&:to_s), list: PROVIDERS.keys.map(&:to_s) }
  encrypts :token, deterministic: true
  encrypts :refresh_token, deterministic: true

  after_destroy_commit :remove_slack_integration

  def api_type_name
    "Integration"
  end

  def application?
    true
  end

  def find_or_initialize_data(name)
    data.find_or_initialize_by(name: name)
  end

  def channels_last_synced_at
    raw_value = data.find_by(name: IntegrationData::CHANNELS_LAST_SYNCED_AT)&.value
    return unless raw_value

    Time.zone.parse(raw_value)
  end

  def channels_synced!
    find_or_initialize_data(IntegrationData::CHANNELS_LAST_SYNCED_AT).update!(value: Time.current.iso8601)
  end

  def repositories_last_synced_at
    raw_value = data.find_by(name: IntegrationData::REPOSITORIES_LAST_SYNCED_AT)&.value
    return unless raw_value

    Time.zone.parse(raw_value)
  end

  def repositories_synced!
    find_or_initialize_data(IntegrationData::REPOSITORIES_LAST_SYNCED_AT).update!(value: Time.current.iso8601)
  end

  def teams_last_synced_at
    raw_value = data.find_by(name: IntegrationData::TEAMS_LAST_SYNCED_AT)&.value
    return unless raw_value

    Time.zone.parse(raw_value)
  end

  def teams_synced!
    find_or_initialize_data(IntegrationData::TEAMS_LAST_SYNCED_AT).update!(value: Time.current.iso8601)
  end

  def campsite_integration?
    provider == "campsite"
  end

  def slack_integration?
    provider == "slack"
  end

  def figma_integration?
    provider == "figma"
  end

  def linear_integration?
    provider == "linear"
  end

  def zapier_integration?
    provider == "zapier"
  end

  def has_link_unfurling_scopes?
    !!scopes&.include?("links:write")
  end

  def has_private_channel_scopes?
    !!scopes&.include?("groups:read")
  end

  def only_scoped_for_notifications?
    !!(scopes && scopes == "im:write,chat:write")
  end

  def remove_slack_integration
    return unless slack_integration?

    Slack::Web::Client.new(token: token).apps_uninstall(
      client_id: Rails.application.credentials.slack.client_id,
      client_secret: Rails.application.credentials.slack.client_secret,
    )
  rescue Slack::Web::Api::Errors::AccountInactive
    # token is no longer valid, do nothing
  end

  def account_name
    data.find_by(name: IntegrationData::ACCOUNT_NAME)&.value
  end

  def account_type
    data.find_by(name: IntegrationData::ACCOUNT_TYPE)&.value
  end

  def account_suspended?
    suspended_value = data.find_by(name: IntegrationData::SUSPENDED)&.value
    ActiveModel::Type::Boolean.new.cast(suspended_value) || false
  end

  def avatar_path
    PROVIDERS.dig(provider.to_sym, :avatar_path)
  end

  def avatar_url(size: nil)
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).url(size: size)
  end

  def avatar_urls
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).urls
  end

  def username
    provider
  end

  def display_name
    PROVIDERS.dig(provider.to_sym, :display_name)
  end

  def installation_id
    data.find_by(name: IntegrationData::INSTALLATION_ID)&.value
  end

  def integration_status
    data.find_by(name: IntegrationData::STATUS)&.value
  end

  def token!
    return token unless token_expired?

    if figma_integration?
      response = FigmaClient::Oauth.new.refresh_token(refresh_token)
      update!(token: response.fetch("access_token"), token_expires_at: response.fetch("expires_in").seconds.from_now)
      return token
    end

    raise "Refresh not implemented for expired token"
  end

  def token_expired?
    return false unless token_expires_at

    token_expires_at.before?(Time.current)
  end

  def export_json
    {
      id: public_id,
      provider: provider,
      created_at: created_at,
      type: "integration",
    }
  end

  private

  def scopes
    data.find_by(name: IntegrationData::SCOPES)&.value
  end

  def generate_token
    return unless zapier_integration? || campsite_integration?

    self.token ||= SecureRandom.hex(32)
  end
end
