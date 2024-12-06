# frozen_string_literal: true

require "test_helper"

class WebPushSubscriptionTest < ActiveSupport::TestCase
  context "#deliver" do
    before do
      Net::HTTPResponse.any_instance.stubs(:body).returns("")
    end

    test "deletes the subscription on 410 response" do
      sub = create(:web_push_subscription)
      mock_response = Net::HTTPGone.new(1.0, "410", "")
      WebPush.expects(:payload_send).raises(WebPush::ExpiredSubscription.new(mock_response, ""))
      sub.deliver!({ title: "Hello" })
      assert_nil WebPushSubscription.find_by(id: sub.id)
      assert ProductLog.exists?(subject: sub.user, name: "web_push_subscription_expired")
    end

    test "deletes the subscription on 404 response" do
      sub = create(:web_push_subscription)
      mock_response = Net::HTTPNotFound.new(1.0, "404", "")
      WebPush.expects(:payload_send).raises(WebPush::InvalidSubscription.new(mock_response, ""))
      sub.deliver!({ title: "Hello" })
      assert_nil WebPushSubscription.find_by(id: sub.id)
      assert ProductLog.exists?(subject: sub.user, name: "web_push_subscription_expired")
    end

    test "raises for anything but 201" do
      sub = create(:web_push_subscription)
      mock_response = Net::HTTPResponse.new(1.0, "500", "")
      WebPush.expects(:payload_send).raises(WebPush::PushServiceError.new(mock_response, ""))
      assert_raises RuntimeError do
        sub.deliver!({ title: "Hello" })
      end
    end

    test "creates a ProductLog on success" do
      sub = create(:web_push_subscription)
      WebPush.expects(:payload_send)
      sub.deliver!({ title: "Hello" })
      assert ProductLog.exists?(subject: sub.user, name: "web_push_payload_sent")
    end
  end
end
