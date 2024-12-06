# frozen_string_literal: true

class CallRoom < ApplicationRecord
  include PublicIdGenerator

  belongs_to :subject, polymorphic: true, optional: true
  belongs_to :organization
  belongs_to :creator, class_name: "OrganizationMembership", optional: true
  has_many :calls, inverse_of: :room, dependent: :destroy_async
  has_many :active_peers, through: :calls
  has_many :peers, through: :calls
  has_many :invitations, class_name: "CallRoomInvitation", inverse_of: :room, dependent: :destroy_async
  has_many :kept_invitations, -> { kept }, class_name: "CallRoomInvitation"

  scope :serializer_eager_load,
    -> {
      eager_load(
        active_peers: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
        peers: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD },
      )
    }

  enum :source, { subject: 0, google_calendar: 3, new_call_button: 4, cal_dot_com: 5 }

  def url
    "#{organization.url}/calls/join/#{public_id}"
  end

  def token(user:)
    return unless remote_room_id

    now = Time.current
    exp = now + 86400

    payload = {
      access_key: Rails.application.credentials.hms.app_access_key,
      room_id: remote_room_id,
      user_id: user&.public_id,
      role: "guest",
      type: "app",
      jti: SecureRandom.uuid,
      version: 2,
      iat: now.to_i,
      nbf: now.to_i,
      exp: exp.to_i,
    }

    JWT.encode(payload, Rails.application.credentials.hms.app_secret, "HS256")
  end

  def create_hms_call_room!
    update!(remote_room_id: hms_client.create_room.id)
    trigger_stale
  end

  def channel_name
    "call-room-#{public_id}"
  end

  def trigger_stale
    PusherTriggerJob.perform_async(channel_name, "call-room-stale", nil.to_json)
  end

  def formatted_title(member)
    subject.formatted_title(member) if subject.respond_to?(:formatted_title)
  end

  def can_invite_participants?
    subject.nil? || personal?
  end

  def personal?
    subject.is_a?(OrganizationMembership)
  end

  def project
    subject.is_a?(Project) ? subject : subject.try(:project)
  end

  private

  def hms_client
    @hms_client ||= HmsClient.new(app_access_key: Rails.application.credentials.hms.app_access_key, app_secret: Rails.application.credentials.hms.app_secret)
  end
end
