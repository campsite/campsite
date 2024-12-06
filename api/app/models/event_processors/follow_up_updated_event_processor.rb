# frozen_string_literal: true

module EventProcessors
  class FollowUpUpdatedEventProcessor < FollowUpBaseEventProcessor
    def process!
      create_notification! if update_showed_follow_up?
    end

    private

    def update_showed_follow_up?
      subject_previous_changes[:shown_at].present? &&
        subject_previous_changes[:shown_at].first.nil? &&
        subject_previous_changes[:shown_at].second.present? &&
        follow_up.shown?
    end
  end
end
