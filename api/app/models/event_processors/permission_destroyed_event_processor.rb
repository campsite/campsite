# frozen_string_literal: true

module EventProcessors
  class PermissionDestroyedEventProcessor < PermissionBaseEventProcessor
    def process!
      permission.notifications.discard_all
      permission.notifications.each(&:delete_slack_message_later)

      if permission.subject.respond_to?(:subscriptions)
        permission.subject.subscriptions.find_by(user: user)&.destroy!
      end

      if permission.subject.respond_to?(:follow_ups)
        permission.subject.follow_ups.each do |follow_up|
          follow_up.destroy! unless Pundit.policy!(follow_up.user, permission.subject).show?
        end
      end

      if permission.subject.respond_to?(:favorites)
        permission.subject.favorites.each do |favorite|
          favorite.destroy! unless Pundit.policy!(favorite.user, permission.subject).show?
        end
      end

      trigger_permissions_stale_event
    end
  end
end
