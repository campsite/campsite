# frozen_string_literal: true

module EventProcessors
  class MessageThreadMembershipUpdateCreatedEventProcessor < BaseEventProcessor
    def process!
      subject.send_message!
    end
  end
end
