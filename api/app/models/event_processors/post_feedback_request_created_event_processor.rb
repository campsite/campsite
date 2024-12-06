# frozen_string_literal: true

module EventProcessors
  class PostFeedbackRequestCreatedEventProcessor < PostFeedbackRequestBaseEventProcessor
    def process!
      notify_feedback_requested_user
    end
  end
end
