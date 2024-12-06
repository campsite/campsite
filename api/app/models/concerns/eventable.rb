# frozen_string_literal: true

module Eventable
  extend ActiveSupport::Concern

  included do
    has_many :events, as: :subject, dependent: :destroy_async
    has_many :notifications, through: :events
    after_create_commit :instrument_created_event
    after_update_commit :instrument_updated_event, unless: -> { respond_to?(:discarded?) && discarded? }
    # Must use after_update_commit instead of after_discard to ensure that
    # transaction is committed and Event is available to ProcessEventJob
    # https://github.com/jhawthorn/discard/issues/73#issue-576101350
    after_update_commit :instrument_destroyed_event, if: -> { respond_to?(:discarded?) && discarded? && discarded_at_previously_changed? }
    delegate :display_name, to: :event_actor, prefix: true, allow_nil: true
    attr_accessor :skip_notifications
    alias_method :skip_notifications?, :skip_notifications
  end

  def instrument_published_event
    event = events.published_action.create!(**event_attributes)
    ProcessEventJob.perform_async(event.id)
  end

  private

  def instrument_created_event
    event = events.created_action.create!(**event_attributes)
    ProcessEventJob.perform_async(event.id)
  end

  def instrument_updated_event
    event = events.updated_action.create!(**event_attributes)
    ProcessEventJob.perform_async(event.id)
  end

  def instrument_destroyed_event
    event = events.destroyed_action.create!(**event_attributes)
    ProcessEventJob.perform_async(event.id)
  end

  def event_attributes
    {
      actor: event_actor,
      organization: event_organization,
      metadata: {
        subject_previous_changes: previous_changes,
        actor_display_name: event_actor_display_name,
      },
      skip_notifications: skip_notifications.presence || false,
    }
  end
end
