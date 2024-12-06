# frozen_string_literal: true

module EventProcessors
  class PermissionBaseEventProcessor < BaseEventProcessor
    alias_method :permission, :subject
    delegate :user, to: :permission

    def trigger_permissions_stale_event
      return unless permission.subject.is_a?(Note)

      event_payload = {
        subject_id: permission.subject.public_id,
        user_id: event.actor.user.public_id,
      }.to_json

      PusherTriggerJob.perform_async(permission.subject.channel_name, "permissions-stale", event_payload)
    end

    private

    def organization_membership
      @organization_membership ||= organization.kept_memberships.find_by!(user: user)
    end

    def organization
      @organization ||= permission.subject.organization
    end
  end
end
