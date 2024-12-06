# frozen_string_literal: true

module WebhookEvents
  class BaseEvent
    def call
      active_webhooks.map do |webhook|
        next unless webhook.includes_event_type?(event_name)
        next unless should_send_to_webhook?(webhook)

        actor = ApiActor.new(oauth_application: webhook.application)
        next unless Pundit.policy(actor, subject).show?

        event = create_webhook_event(webhook)
        DeliverWebhookJob.perform_async(event.id)
        event
      end
    end

    def should_send_to_webhook?(webhook)
      true
    end

    private

    def organization
      raise NotImplementedError, "#{self.class} must implement #organization"
    end

    def subject
      raise NotImplementedError, "#{self.class} must implement #subject"
    end

    def event_name
      raise NotImplementedError, "#{self.class} must implement #event_name"
    end

    def payload
      raise NotImplementedError, "#{self.class} must implement #payload"
    end

    def active_webhooks
      organization.active_webhooks
    end

    def create_webhook_event(webhook)
      webhook.events.create!(
        event_type: event_name,
        payload: build_payload(webhook),
        subject: subject,
      )
    end

    def build_payload(webhook)
      {
        type: event_name,
        timestamp: Time.current.iso8601,
        organization_id: organization.public_id,
        application_id: webhook.application&.public_id,
        data: payload,
      }
    end
  end
end
