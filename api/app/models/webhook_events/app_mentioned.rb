# frozen_string_literal: true

module WebhookEvents
  class AppMentioned < BaseEvent
    attr_reader :subject, :oauth_application

    delegate :active_webhooks, to: :oauth_application

    def initialize(subject:, oauth_application:)
      @subject = subject
      @oauth_application = oauth_application
    end

    private

    def organization
      subject.organization
    end

    def event_name
      "app.mentioned"
    end

    def payload
      V2AppMentionSubjectSerializer.render_as_hash(subject)
    end
  end
end
