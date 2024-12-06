# frozen_string_literal: true

require "test_helper"

class DeliverWebhookJobTest < ActiveJob::TestCase
  setup do
    @event = create(:webhook_event)
    @webhook = @event.webhook
  end

  context "#perform" do
    test "marks the event as successful when delivery is successful" do
      VCR.use_cassette("webhooks/success") do
        assert_difference -> { WebhookDelivery.count }, 1 do
          DeliverWebhookJob.new.perform(@event.id)
        end
      end

      @event.reload
      assert_equal 1, @event.deliveries_count
      assert_equal "delivered", @event.status
      assert_equal 200, @event.deliveries.last.status_code
    end

    test "does not deliver the event if it is already delivered" do
      @event.update!(status: :delivered)

      assert_no_difference -> { WebhookDelivery.count } do
        DeliverWebhookJob.new.perform(@event.id)
      end
    end

    test "does not deliver the event if it is canceled" do
      @event.update!(status: :canceled)

      assert_no_difference -> { WebhookDelivery.count } do
        DeliverWebhookJob.new.perform(@event.id)
      end
    end

    test "marks the event as failed when delivery fails" do
      VCR.use_cassette("webhooks/server_error") do
        assert_difference -> { WebhookDelivery.count }, 1 do
          assert_raises(DeliverWebhookJob::DeliveryError) do
            DeliverWebhookJob.new.perform(@event.id)
          end
        end
      end

      @event.reload
      assert_equal 1, @event.deliveries_count
      assert_equal "failing", @event.status
    end

    test "marks the event as canceled when the webhook is inactive" do
      @webhook.update!(state: :disabled)

      assert_no_difference -> { WebhookDelivery.count } do
        DeliverWebhookJob.new.perform(@event.id)
      end

      @event.reload
      assert_equal "canceled", @event.status
    end

    test "marks the event as canceled after all retries are exhausted" do
      DeliverWebhookJob::FailureHandler.call({ "args" => [@event.id] })

      @event.reload
      assert_equal "canceled", @event.status
    end
  end
end
