# frozen_string_literal: true

module EventProcessors
  class ReactionDestroyedEventProcessor < ReactionBaseEventProcessor
    def process!
      reaction.notifications.discard_all
    end
  end
end
