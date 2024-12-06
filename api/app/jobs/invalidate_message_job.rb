# frozen_string_literal: true

class InvalidateMessageJob < BaseJob
  sidekiq_options queue: "critical", retry: 3

  def perform(_actor_member_id, message_id, event_name)
    message_thread = MessageThread.joins(:messages)
      .eager_load(:organization_memberships)
      .find_by(messages: { id: message_id })
    message_thread.kept_organization_memberships.each do |member|
      MessageJob.perform_async(member.id, message_id, event_name)
    end
  end
end
