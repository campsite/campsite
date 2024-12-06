# frozen_string_literal: true

module EventProcessors
  class ReactionBaseEventProcessor < BaseEventProcessor
    alias_method :reaction, :subject
  end
end
