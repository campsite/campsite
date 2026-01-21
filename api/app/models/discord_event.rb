# frozen_string_literal: true

class DiscordEvent < ApplicationRecord
  # Discord event types we care about
  MESSAGE_CREATE = "MESSAGE_CREATE"
  MESSAGE_UPDATE = "MESSAGE_UPDATE"
  MESSAGE_DELETE = "MESSAGE_DELETE"
  GUILD_MEMBER_ADD = "GUILD_MEMBER_ADD"
  GUILD_MEMBER_REMOVE = "GUILD_MEMBER_REMOVE"
  CHANNEL_CREATE = "CHANNEL_CREATE"
  CHANNEL_UPDATE = "CHANNEL_UPDATE"
  CHANNEL_DELETE = "CHANNEL_DELETE"

  validates :event_type, presence: true
  validates :event_id, uniqueness: { allow_nil: true }

  scope :unprocessed, -> { where(processed_at: nil) }
  scope :processed, -> { where.not(processed_at: nil) }

  def processed?
    processed_at.present?
  end

  def process!
    return if processed?

    case event_type
    when MESSAGE_CREATE
      process_message_create
    when MESSAGE_UPDATE
      process_message_update
    when MESSAGE_DELETE
      process_message_delete
    when GUILD_MEMBER_ADD
      process_guild_member_add
    when GUILD_MEMBER_REMOVE
      process_guild_member_remove
    when CHANNEL_CREATE
      process_channel_create
    when CHANNEL_UPDATE
      process_channel_update
    when CHANNEL_DELETE
      process_channel_delete
    end

    update!(processed_at: Time.current)
  end

  private

  def process_message_create
    ProcessDiscordMessageJob.perform_later(self)
  end

  def process_message_update
    UpdateDiscordMessageJob.perform_later(self)
  end

  def process_message_delete
    DeleteDiscordMessageJob.perform_later(self)
  end

  def process_guild_member_add
    SyncDiscordMemberJob.perform_later(self, action: :add)
  end

  def process_guild_member_remove
    SyncDiscordMemberJob.perform_later(self, action: :remove)
  end

  def process_channel_create
    SyncDiscordChannelJob.perform_later(self, action: :create)
  end

  def process_channel_update
    SyncDiscordChannelJob.perform_later(self, action: :update)
  end

  def process_channel_delete
    SyncDiscordChannelJob.perform_later(self, action: :delete)
  end
end