# frozen_string_literal: true

class Event < ApplicationRecord
  belongs_to :actor, polymorphic: true, optional: true
  belongs_to :subject, polymorphic: true

  belongs_to :organization
  has_many :notifications, dependent: :destroy_async

  enum :action, { created: 0, updated: 1, destroyed: 2, published: 3 }, suffix: true

  def process!
    processor.new(self).process!
    update!(processed_at: Time.current)
  end

  def processed?
    !!processed_at
  end

  def subject_previous_changes
    metadata.dig("subject_previous_changes").with_indifferent_access
  end

  def actor
    super || OrganizationMembership::NullOrganizationMembership.new(display_name: metadata&.dig("actor_display_name"))
  end

  def named_actor?
    actor.display_name.present?
  end

  private

  def processor
    if created_action?
      case subject
      when Post
        return EventProcessors::PostCreatedEventProcessor
      when Comment
        return EventProcessors::CommentCreatedEventProcessor
      when Reaction
        return EventProcessors::ReactionCreatedEventProcessor
      when PostFeedbackRequest
        return EventProcessors::PostFeedbackRequestCreatedEventProcessor
      when Permission
        return EventProcessors::PermissionCreatedEventProcessor
      when MessageThreadMembershipUpdate
        return EventProcessors::MessageThreadMembershipUpdateCreatedEventProcessor
      when MessageThread
        return EventProcessors::MessageThreadCreatedEventProcessor
      when Note
        return EventProcessors::NoteCreatedEventProcessor
      when ProjectMembership
        return EventProcessors::ProjectMembershipCreatedEventProcessor
      when Project
        return EventProcessors::ProjectCreatedEventProcessor
      when FollowUp
        return EventProcessors::FollowUpCreatedEventProcessor
      when ProjectPin
        return EventProcessors::ProjectPinCreatedEventProcessor
      when Call
        return EventProcessors::CallCreatedEventProcessor
      end
    elsif updated_action?
      case subject
      when Post
        return EventProcessors::PostUpdatedEventProcessor
      when Comment
        return EventProcessors::CommentUpdatedEventProcessor
      when Reaction
        return EventProcessors::ReactionUpdatedEventProcessor
      when PostFeedbackRequest
        return EventProcessors::PostFeedbackRequestUpdatedEventProcessor
      when Permission
        return EventProcessors::PermissionUpdatedEventProcessor
      when MessageThread
        return EventProcessors::MessageThreadUpdatedEventProcessor
      when Note
        return EventProcessors::NoteUpdatedEventProcessor
      when ProjectMembership
        return EventProcessors::ProjectMembershipUpdatedEventProcessor
      when Project
        return EventProcessors::ProjectUpdatedEventProcessor
      when FollowUp
        return EventProcessors::FollowUpUpdatedEventProcessor
      when ProjectPin
        return EventProcessors::ProjectPinUpdatedEventProcessor
      when Call
        return EventProcessors::CallUpdatedEventProcessor
      end
    elsif destroyed_action?
      case subject
      when Post
        return EventProcessors::PostDestroyedEventProcessor
      when Comment
        return EventProcessors::CommentDestroyedEventProcessor
      when Reaction
        return EventProcessors::ReactionDestroyedEventProcessor
      when PostFeedbackRequest
        return EventProcessors::PostFeedbackRequestDestroyedEventProcessor
      when Permission
        return EventProcessors::PermissionDestroyedEventProcessor
      when MessageThread
        return EventProcessors::MessageThreadDestroyedEventProcessor
      when Note
        return EventProcessors::NoteDestroyedEventProcessor
      when ProjectMembership
        return EventProcessors::ProjectMembershipDestroyedEventProcessor
      when ProjectPin
        return EventProcessors::ProjectPinDestroyedEventProcessor
      end
    elsif published_action?
      case subject
      when Post
        return EventProcessors::PostPublishedEventProcessor
      when PostFeedbackRequest
        return EventProcessors::PostFeedbackRequestPublishedEventProcessor
      end
    end

    raise "No event processor found for #{subject_type} #{action}"
  end
end
