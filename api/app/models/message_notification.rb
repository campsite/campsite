# frozen_string_literal: true

class MessageNotification < ApplicationRecord
  belongs_to :message_thread_membership
  belongs_to :message

  scope :since, ->(time) { where(created_at: time..) }

  delegate :organization_membership, :organization, :user, to: :message_thread_membership, allow_nil: true
  delegate :message_thread, to: :message_thread_membership

  scope :unread, -> {
    joins(:message_thread_membership, :message)
      .where(
        <<~SQL.squish,
          message_thread_memberships.last_read_at IS NULL
          OR message_thread_memberships.last_read_at < messages.created_at
        SQL
      )
  }

  def deliver_email_later
    return if !user&.email_notifications_enabled? || user.notifications_paused?

    ScheduleUserNotificationsEmailJob.perform_async(user.id, created_at.iso8601)
  end
end
