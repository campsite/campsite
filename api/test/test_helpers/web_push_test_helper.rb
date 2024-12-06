# frozen_string_literal: true

module WebPushTestHelper
  def sample_web_push_payload(subscription:, message:)
    session_id = SecureRandom.uuid
    SecureRandom.stubs(:uuid).returns(session_id)

    {
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      vapid: Rails.application.credentials.dig(:webpush_vapid),
      message: message.merge(
        icon: "http://campsite-test.imgix.net/static/apple-touch-icon-512.png",
        session_id: session_id,
        user_id: subscription.user.public_id,
      ).to_json,
      urgency: "high",
    }
  end
end
