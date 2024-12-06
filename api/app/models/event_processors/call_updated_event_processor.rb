# frozen_string_literal: true

module EventProcessors
  class CallUpdatedEventProcessor < CallBaseEventProcessor
    def process!
      if completed_processing?
        call.organization_memberships.each do |organization_membership|
          create_notification!(reason: :processing_complete, organization_membership: organization_membership)
        end
      end
    end

    private

    def completed_processing?
      return unless call.completed_generated_summary_status? && call.completed_generated_title_status?

      subject_previous_changes[:generated_summary_status]&.last == "completed" || subject_previous_changes[:generated_title_status]&.last == "completed"
    end
  end
end
