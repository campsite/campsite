# frozen_string_literal: true

class DeliverWebhookJob < BaseJob
  sidekiq_options queue: "default", retry: Webhook::MAX_ATTEMPTS

  class DeliveryError < StandardError; end

  FailureHandler = lambda { |msg|
    event = WebhookEvent.includes(:webhook, :deliveries).find(msg["args"].first)
    event.update(status: :canceled)
  }

  sidekiq_retries_exhausted(&FailureHandler)

  def perform(webhook_event_id)
    event = WebhookEvent.includes(:webhook, :deliveries).find(webhook_event_id)

    return if event.canceled? || event.delivered?

    if event.webhook.inactive?
      event.update!(status: :canceled)
      return
    end

    delivery = event.deliveries.create!

    status_code = nil

    begin
      conn = Faraday.new(request: { timeout: Webhook::TIMEOUT })

      response = conn.post(
        event.webhook.url,
        event.prepared_payload.to_json,
        delivery.headers,
      )

      status_code = response.status
    rescue Faraday::TimeoutError
      status_code = 408
    rescue Faraday::ConnectionFailed
      status_code = 502
    end

    delivery.update!(
      delivered_at: Time.current,
      status_code: status_code,
    )

    if status_code.in?(200..299)
      event.update!(status: :delivered)
    else
      event.update!(status: :failing)

      raise DeliveryError, "Delivery to webhook #{event.webhook.id} failed with status code #{status_code}"
    end
  end
end
