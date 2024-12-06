# frozen_string_literal: true

class ZapierMessage
  include ActiveModel::Model

  attr_accessor :content, :thread_id, :parent_id, :integration, :organization, :oauth_application

  validates :content, presence: true
  validate :thread_id_or_parent_id
  validate :thread_ownership

  def create!
    validate!

    message_thread.send_message!(
      integration: integration,
      content: content,
      reply_to: current_reply&.public_id,
      oauth_application: oauth_application,
    )
  end

  private

  def thread_id_or_parent_id
    errors.add(:base, "thread_id or parent_id must be present") if !thread_id && !parent_id
    errors.add(:base, "thread_id and parent_id cannot both be present") if thread_id && parent_id
  end

  def thread_ownership
    errors.add(:base, "Thread does not belong to this organization") if message_thread.owner.organization != organization
  end

  def message_thread
    @message_thread ||= current_reply&.message_thread || MessageThread.includes(:owner).find_by!(public_id: thread_id)
  end

  def current_reply
    return if parent_id.blank?

    @current_reply ||= Message.includes(message_thread: :owner).find_by!(public_id: parent_id)
  end
end
