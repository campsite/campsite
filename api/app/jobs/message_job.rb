# frozen_string_literal: true

class MessageJob < BaseJob
  sidekiq_options queue: "critical", retry: 3

  def perform(to_member_id, message_id, event_name)
    to_member = OrganizationMembership
      .kept
      .eager_load(:message_thread_memberships, user: :web_push_subscriptions)
      .find(to_member_id)
    message = Message
      .eager_load(:reply_to)
      .preload(message_thread: MessageThread::SERIALIZER_INCLUDES)
      .find(message_id)
    message_thread = message.message_thread
    ignore_pause = event_name == "force-message-notification"
    skip_push = message.skip_push?(to_member: to_member, ignore_pause: ignore_pause)

    if !skip_push && event_name.in?(["new-message", "force-message-notification"])
      message.message_notifications.create!(message_thread_membership: to_member.message_thread_memberships.find_by!(message_thread: message_thread))
        .deliver_email_later

      to_member.user.web_push_subscriptions.each do |sub|
        DeliverWebPushMessageJob.perform_in(10.seconds, message_id, sub.id, to_member_id, ignore_pause)
      end
    end

    payload = PusherInvalidateMessageSerializer.preload_and_render(
      {
        message: message,
        message_thread: message_thread,
        skip_push: skip_push,
        push_body: message.preview_truncated(thread: message_thread, viewer: to_member),
      },
      member: to_member,
      user: to_member.user,
    )

    # always deliver system events
    socket_id = message.system? ? nil : Current.pusher_socket_id

    begin
      Pusher.trigger(
        to_member.user.channel_name,
        event_name,
        payload,
        { socket_id: socket_id }.compact,
      )
    rescue Pusher::Error => e
      # https://github.com/pusher/pusher-http-ruby/blob/18109ec781501c673fb1853869cf89f8ed27296d/lib/pusher/request.rb#L97-L98
      if e.message == "Payload Too Large > 10KB"
        fallback_payload = {
          message_thread_id: message.message_thread.public_id,
          organization_slug: message.message_thread.organization_slug,
        }
        Pusher.trigger(
          to_member.user.channel_name,
          "invalidate-thread",
          fallback_payload,
          { socket_id: socket_id }.compact,
        )
      else
        raise e
      end
    end
  end
end
