# frozen_string_literal: true

class DeliverWebPushCallRoomInvitationJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(call_room_id, creator_id, web_push_subscription_id)
    call_room = CallRoom.find(call_room_id)
    creator = OrganizationMembership.eager_load(:user).find(creator_id)
    subscription = WebPushSubscription.eager_load(:user).find(web_push_subscription_id)

    message = {
      title: "#{creator.user.display_name} invited you to a call",
      app_badge_count: subscription.user.unread_notifications_count,
      target_url: call_room.url,
    }

    subscription.deliver!(message)
  end
end
