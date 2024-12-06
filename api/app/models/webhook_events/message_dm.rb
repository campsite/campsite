# frozen_string_literal: true

module WebhookEvents
  class MessageDm < BaseEvent
    attr_reader :message

    def initialize(message:)
      @message = message
    end

    def should_send_to_webhook?(webhook)
      return true unless webhook.application

      webhook.application != message.oauth_application
    end

    private

    def subject
      message
    end

    def organization
      message.organization
    end

    def event_name
      "message.dm"
    end

    def payload
      {
        message: V2MessageSerializer.render_as_hash(message),
      }
    end
  end
end
