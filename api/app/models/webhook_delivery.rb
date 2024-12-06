# frozen_string_literal: true

class WebhookDelivery < ApplicationRecord
  include PublicIdGenerator

  belongs_to :webhook_event

  delegate :subject, to: :webhook_event

  counter_culture :webhook_event, column_name: "deliveries_count"

  validates :signature, presence: true

  before_validation :generate_signature

  def headers
    {
      "Content-Type" => "application/json",
      "X-Campsite-Signature" => "t=#{timestamp},v1=#{signature}",
    }
  end

  def timestamp
    created_at.to_i
  end

  private

  def generate_signature
    self.created_at ||= Time.current

    # we use JSON.generate here because to_json encodes special characters like ? and & as Unicode escapes,
    # which may cause users' signature validation to fail.
    payload = JSON.generate(webhook_event.prepared_payload)
    signed_payload = "#{timestamp}.#{payload}"

    self.signature = OpenSSL::HMAC.hexdigest("SHA256", webhook_event.webhook.secret, signed_payload)
  end
end
