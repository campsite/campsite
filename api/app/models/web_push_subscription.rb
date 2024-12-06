# frozen_string_literal: true

class WebPushSubscription < ApplicationRecord
  belongs_to :user

  attr_accessor :session_id

  def deliver!(message)
    self.session_id = SecureRandom.uuid
    deliver(message)
  rescue WebPush::ExpiredSubscription, WebPush::InvalidSubscription
    create_product_log!(name: "web_push_subscription_expired")
    destroy!
  end

  private

  def deliver(message)
    vapid_keys = Rails.application.credentials.dig(:webpush_vapid)

    uri = Addressable::URI.parse(Rails.application.credentials.imgix.url)
    uri.path = "static/apple-touch-icon-512.png"

    message = message.merge(
      icon: uri.to_s,
      session_id: session_id,
      user_id: user.public_id,
    )

    # strip all nil fields
    message = message.compact

    WebPush.payload_send(
      endpoint: endpoint,
      p256dh: p256dh,
      auth: auth,
      vapid: vapid_keys,
      message: message.to_json,
      urgency: "high",
    )

    create_product_log!(name: "web_push_payload_sent", data: message.slice(:title, :app_badge_count, :target_url))
  end

  def create_product_log!(name:, data: nil)
    ProductLog.create!(subject: user, session_id: session_id, log_ts: Time.current, name: name, data: data)
  end
end
