# frozen_string_literal: true

module WebhookEvents
  class PostCreated < BaseEvent
    attr_reader :post

    def initialize(post:)
      @post = post
    end

    private

    def subject
      post
    end

    def organization
      post.organization
    end

    def event_name
      "post.created"
    end

    def payload
      {
        post: V2PostSerializer.render_as_hash(post),
      }
    end
  end
end
