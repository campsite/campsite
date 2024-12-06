# frozen_string_literal: true

class CreateMessageThreadCallRoomJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(message_thread_id)
    thread = MessageThread.eager_load(organization_memberships: :user).find(message_thread_id)
    thread.create_hms_call_room!

    thread.organization_memberships.each do |member|
      # Call Pusher directly. PusherTriggerJob skips sending events to the
      # user that triggered the event via socket_id, which we don't want here.
      Pusher.trigger(
        member.user.channel_name,
        "thread-updated",
        {
          id: thread.public_id,
          organization_slug: thread.organization.slug,
          remote_call_room_id: thread.remote_call_room_id,
        },
      )
    end
  end
end
