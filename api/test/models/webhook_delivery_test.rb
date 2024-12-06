# frozen_string_literal: true

require "test_helper"

class WebhookDeliveryTest < ActiveSupport::TestCase
  test "generates signature" do
    delivery = build(:webhook_delivery)

    assert delivery.valid?
    assert_not_nil delivery.signature
    assert_equal "application/json", delivery.headers["Content-Type"]
    assert_equal "t=#{delivery.timestamp},v1=#{delivery.signature}", delivery.headers["X-Campsite-Signature"]
  end

  test "rebuilt signature matches" do
    payload = { foo: "bar", url: "https://example.com?foo=bar&baz=qux" }
    delivery = create(:webhook_delivery, webhook_event: create(:webhook_event, payload: payload))
    event = delivery.webhook_event
    webhook = event.webhook

    signature_header = delivery.headers["X-Campsite-Signature"]
    timestamp, signature = signature_header.split(",").map { |part| part.split("=")[1] }
    signed_payload = "#{timestamp}.{\"foo\":\"bar\",\"url\":\"https://example.com?foo=bar&baz=qux\",\"id\":\"#{event.public_id}\"}"
    expected_signature = OpenSSL::HMAC.hexdigest("SHA256", webhook.secret, signed_payload)

    assert ActiveSupport::SecurityUtils.secure_compare(expected_signature, signature)
  end
end
