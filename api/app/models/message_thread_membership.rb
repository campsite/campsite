# frozen_string_literal: true

class MessageThreadMembership < ApplicationRecord
  belongs_to :message_thread
  belongs_to :organization_membership, optional: true
  belongs_to :oauth_application, optional: true

  has_many :message_notifications, dependent: :destroy_async

  delegate :user, :organization, to: :organization_membership, allow_nil: true

  enum :notification_level, { all: 0, mentions: 1, none: 2 }, prefix: true

  counter_culture :message_thread, column_name: "members_count"

  scope :unread, ->(message_thread_memberships_table_alias: :message_thread_memberships) do
    where(
      <<~SQL.squish,
        EXISTS(
          SELECT 1 from messages
          WHERE messages.message_thread_id = #{message_thread_memberships_table_alias}.message_thread_id
            AND (#{message_thread_memberships_table_alias}.last_read_at IS NULL OR messages.created_at > #{message_thread_memberships_table_alias}.last_read_at)
            AND NOT messages.sender_id <=> #{message_thread_memberships_table_alias}.organization_membership_id
            AND messages.discarded_at IS NULL
          LIMIT 1
        )
      SQL
    )
  end

  scope :manually_marked_unread, -> { where("manually_marked_unread_at IS NOT NULL AND (last_read_at IS NULL OR manually_marked_unread_at > last_read_at)") }
end
