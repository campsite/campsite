# frozen_string_literal: true

module EventProcessors
  class PostFeedbackRequestDestroyedEventProcessor < PostFeedbackRequestBaseEventProcessor
    def process!
      post_feedback_request.notifications.discard_all
      post_feedback_request.notifications.each(&:delete_slack_message_later)
    end
  end
end
