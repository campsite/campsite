# frozen_string_literal: true

module EventProcessors
  class BaseEventProcessor
    def initialize(event)
      @event = event
      @notified_user_ids = Set.new
    end

    attr_reader :event, :notified_user_ids

    delegate :actor, :subject, :organization, :subject_previous_changes, to: :event

    private

    def all_user_mentions
      subject.new_user_mentions(previous_text: "")
    end

    def all_app_mentions
      subject.new_app_mentions(previous_text: "")
    end

    def new_user_mentions
      return subject.class.none unless mentionable_text_changes

      subject.new_user_mentions(previous_text: mentionable_text_changes.first || "")
    end

    def new_app_mentions
      return subject.class.none unless mentionable_text_changes

      subject.new_app_mentions(previous_text: mentionable_text_changes.first || "")
    end

    def subject_restored?
      subject_previous_changes[:discarded_at]&.first.present? && !subject.discarded?
    end

    def mentionable_text_changes
      subject_previous_changes[subject.mentionable_attribute]
    end
  end
end
