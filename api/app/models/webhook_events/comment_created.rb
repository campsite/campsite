# frozen_string_literal: true

module WebhookEvents
  class CommentCreated < BaseEvent
    attr_reader :comment

    def initialize(comment:)
      @comment = comment
    end

    private

    def subject
      comment
    end

    def organization
      comment.organization
    end

    def event_name
      "comment.created"
    end

    def payload
      {
        comment: V2CommentSerializer.render_as_hash(comment),
      }
    end
  end
end
