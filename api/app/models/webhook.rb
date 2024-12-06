# frozen_string_literal: true

class Webhook < ApplicationRecord
  include PublicIdGenerator
  include Discard::Model

  URL_REGEX = URI.regexp(["http", "https"])
  DENIED_HOSTS = ["localhost", "127.0.0.1"].freeze
  MAX_ATTEMPTS = 10
  TIMEOUT = 20

  # Sync this with SUPPORTED_EVENTS in Webhooks.tsx in the web app
  SUPPORTED_EVENTS = ["post.created", "comment.created", "app.mentioned", "message.created", "message.dm"].freeze

  belongs_to :owner, polymorphic: true
  belongs_to :creator, class_name: "OrganizationMembership"
  has_many :events, dependent: :destroy, class_name: "WebhookEvent"

  enum :state, { enabled: 0, disabled: 1 }

  encrypts :secret, deterministic: true

  before_validation :generate_secret, on: :create

  validates :url,
    presence: true,
    format: { with: URL_REGEX, allow_blank: true }
  validate :url_host
  validate :enforce_https_in_production
  validate :validate_event_types

  after_discard :mark_as_disabled
  after_discard :cancel_pending_events

  def inactive?
    !enabled?
  end

  def application
    nil unless owner_type == OauthApplication.polymorphic_name

    owner
  end

  def includes_event_type?(event_type)
    event_types.include?(event_type)
  end

  private

  def validate_event_types
    return if event_types.blank?

    invalid_event_types = event_types.reject { |event_type| SUPPORTED_EVENTS.include?(event_type) }
    errors.add(:event_types, "contains unsupported events: #{invalid_event_types.join(", ")}") if invalid_event_types.any?
  end

  def uri
    @uri ||= URI(url)
  rescue URI::InvalidURIError
    errors.add(:url, "is invalid")
  end

  def generate_secret
    self.secret ||= SecureRandom.hex(16)
  end

  def url_host
    return unless uri

    if DENIED_HOSTS.include?(uri.host)
      errors.add(:url, "host is invalid")
    end
  end

  def enforce_https_in_production
    return unless Rails.env.production?
    return if uri&.scheme == "https"

    errors.add(:url, "must use HTTPS in production")
  end

  def mark_as_disabled
    self.state = :disabled
    save!
  end

  def cancel_pending_events
    events.unresolved.update_all(status: :canceled)
  end
end
