# frozen_string_literal: true

require "test_helper"
require "test_helpers/web_push_test_helper"

class DeliverWebPushNotificationJobTest < ActiveJob::TestCase
  include WebPushTestHelper

  context "perform" do
    test "it includes the body in the payload" do
      mentioned_member = create(:organization_membership, user: create(:user, username: "mentioned", name: "Mentioned"))
      post = create(:post, title: "", description_html: "<p>Sup #{MentionsFormatter.format_mention(mentioned_member)}</p>", organization: mentioned_member.organization)

      sub = create(:web_push_subscription, user: mentioned_member.user)
      event = post.events.created_action.first!
      event.process!
      notification = mentioned_member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: notification.summary_text,
            body: "Sup @Mentioned",
            app_badge_count: 1,
            target_url: notification.subject.url,
          },
        ),
      )
      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end

    test "it works for project membership events" do
      project = create(:project, name: "Catdog")
      member = create(:organization_membership, organization: project.organization)
      actor = create(:organization_membership, organization: project.organization, user: create(:user, name: "Foo Bar"))
      project_membership = create(:project_membership, organization_membership: member, project: project, event_actor: actor)
      event = project_membership.events.created_action.first!

      sub = create(:web_push_subscription, user: member.user)
      event.process!
      notification = member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: "Foo Bar added you to Catdog",
            app_badge_count: 0,
            target_url: notification.subject.url,
          },
        ),
      )

      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end

    test "it works for feedback request events" do
      post = create(:post, member: create(:organization_membership, user: create(:user, name: "Foo Bar")), description_html: "<p>Sup</p>")
      member = create(:organization_membership, organization: post.organization)
      request = create(:post_feedback_request, post: post, member: member)
      event = request.events.created_action.first!

      sub = create(:web_push_subscription, user: member.user)
      event.process!
      notification = member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: "Foo Bar requested your feedback",
            body: "Sup",
            app_badge_count: 1,
            target_url: notification.subject.url,
          },
        ),
      )

      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end

    test "it works for post follow up events" do
      post = create(:post)
      member = create(:organization_membership, organization: post.organization)
      follow_up = create(:follow_up, subject: post, organization_membership: member)
      follow_up.show!
      event = follow_up.events.updated_action.first!

      sub = create(:web_push_subscription, user: member.user)
      event.process!
      notification = member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: "Follow up on Look at these designs",
            app_badge_count: 1,
            target_url: post.url,
          },
        ),
      )

      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end

    test "it works for comment follow up events" do
      post = create(:post)
      comment = create(:comment, subject: post)
      member = create(:organization_membership, organization: post.organization)
      follow_up = create(:follow_up, subject: comment, organization_membership: member)
      follow_up.show!
      event = follow_up.events.updated_action.first!

      sub = create(:web_push_subscription, user: member.user)
      event.process!
      notification = member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: "Follow up on Look at these designs",
            body: "gimme some feedback",
            app_badge_count: 1,
            target_url: comment.url,
          },
        ),
      )

      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end

    test "it works for note follow up events" do
      note = create(:note)
      member = note.member
      follow_up = create(:follow_up, subject: note, organization_membership: member)
      follow_up.show!
      event = follow_up.events.updated_action.first!

      sub = create(:web_push_subscription, user: member.user)
      event.process!
      notification = member.notifications.last!

      WebPush.expects(:payload_send).with(
        **sample_web_push_payload(
          subscription: sub,
          message: {
            title: "Follow up on Cool new note",
            body: "Hey there",
            app_badge_count: 1,
            target_url: note.url,
          },
        ),
      )

      DeliverWebPushNotificationJob.new.perform(notification.id, sub.id)
    end
  end
end
