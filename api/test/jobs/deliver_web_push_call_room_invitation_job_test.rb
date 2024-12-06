# frozen_string_literal: true

require "test_helper"
require "test_helpers/web_push_test_helper"

class DeliverWebPushCallRoomInvitationJobTest < ActiveJob::TestCase
  include WebPushTestHelper

  setup do
    @organization = create(:organization)
    @call_room = create(:call_room, organization: @organization, subject: nil)
    @inviter_member = create(:organization_membership, organization: @organization)
    @inviter_user = @inviter_member.user
    @invitee_member = create(:organization_membership, organization: @organization)
    @invitee_user = @invitee_member.user
    @invitee_web_push_subscription = create(:web_push_subscription, user: @invitee_user)
  end

  context "#perform" do
    test "it send a web push about the invitation" do
      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: @invitee_web_push_subscription,
          message: {
            title: "#{@inviter_user.display_name} invited you to a call",
            app_badge_count: 0,
            target_url: @call_room.url,
          },
        ),
      )
      DeliverWebPushCallRoomInvitationJob.new.perform(@call_room.id, @inviter_member.id, @invitee_web_push_subscription.id)
    end
  end
end
