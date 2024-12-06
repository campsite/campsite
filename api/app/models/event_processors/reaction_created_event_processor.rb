# frozen_string_literal: true

module EventProcessors
  class ReactionCreatedEventProcessor < ReactionBaseEventProcessor
    def process!
      return if !reaction.notification_member || !Pundit.policy!(reaction.notification_member.user, reaction.subject).show? || reaction.notification_member == reaction.member

      event.notifications.author.create!(
        organization_membership: reaction.notification_member,
        target: reaction.notification_target,
        target_scope: :reaction,
      )
    end
  end
end
