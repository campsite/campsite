# frozen_string_literal: true

require "test_helper"

class UserNotificationsEmailJobTest < ActiveJob::TestCase
  context "perform" do
    test "schedules mailer when one org has notifications" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      event = post.events.created_action.first!
      notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 1
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "schedules mailer when scheduled_email_notifications_from matches notification" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      event = post.events.created_action.first!
      notification = create(:notification, :mention, organization_membership: member, event: event, target: post)
      member.user.update!(scheduled_email_notifications_from: notification.created_at)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 1
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "schedules mailer per org with notifications" do
      member1 = create(:organization_membership)
      post1 = create(:post, organization: member1.organization)
      event1 = post1.events.created_action.first!
      notification1 = create(:notification, :mention, organization_membership: member1, event: event1, target: post1)

      member2 = create(:organization_membership, user: member1.user)
      post2 = create(:post, organization: member2.organization)
      event2 = post2.events.created_action.first!
      notification2 = create(:notification, :mention, organization_membership: member2, event: event2, target: post2)

      UserNotificationsEmailJob.new.perform(member1.user.id)

      assert_enqueued_emails 2
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member1.user, member1.organization, [notification1], []])
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member1.user, member2.organization, [notification2], []])
    end

    test "schedules mailer for new project membership notification" do
      project_membership = create(:project_membership)
      member = project_membership.organization_membership
      project = project_membership.project
      project_membership_event = project_membership.events.created_action.first!
      notification = create(:notification, :added, organization_membership: member, event: project_membership_event, target: project)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "schedules mailer for project archived notification" do
      project_membership = create(:project_membership)
      member = project_membership.organization_membership
      project = project_membership.project
      project.archive!(create(:organization_membership, organization: project.organization))
      project_archived_event = project.events.updated_action.first!
      notification = create(:notification, :subject_archived, organization_membership: member, event: project_archived_event, target: project)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "schedules mailer for follow up notification" do
      follow_up = create(:follow_up)
      follow_up.show!
      member = follow_up.organization_membership
      event = follow_up.events.updated_action.first!
      notification = create(:notification, :subject_archived, organization_membership: member, event: event, target: follow_up.subject)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "schedules mailer for call notification" do
      call = create(:call)
      member = create(:organization_membership, organization: call.organization)
      create(:call_peer, call: call, organization_membership: member)
      call.update!(generated_summary_status: :completed, generated_title_status: :completed)
      event = call.events.updated_action.last!
      notification = create(:notification, :processing_complete, organization_membership: member, event: event, target: call)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification], []])
    end

    test "does not schedule for read notifications" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      event = post.events.created_action.first!
      notification = create(:notification, :mention, organization_membership: member, event: event, target: post)
      notification.mark_read!

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 0
    end

    test "reaction does not suppress mention" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      mention = create(:notification, :mention, organization_membership: member, event: post.events.created_action.first!, target: post)
      reaction = create(:reaction, subject: post, member: member)
      create(:notification, :mention, organization_membership: member, event: reaction.events.created_action.first!, target: post)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 1
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [mention], []])
    end

    test "does not send mail for previously sent mail" do
      member = create(:organization_membership)
      post1 = create(:post, organization: member.organization)
      event1 = post1.events.created_action.first!
      notification1 = create(:notification, :mention, organization_membership: member, event: event1, target: post1)
      member.user.update!(scheduled_email_notifications_from: notification1.created_at)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 1
      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification1], []])

      Timecop.travel(1.hour.from_now) do
        post2 = create(:post, organization: member.organization)
        event2 = post2.events.created_action.first!
        notification2 = create(:notification, :mention, organization_membership: member, event: event2, target: post2)
        member.user.update!(scheduled_email_notifications_from: notification2.created_at)

        UserNotificationsEmailJob.new.perform(member.user.id)

        assert_enqueued_emails 2
        assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [notification2], []])
      end
    end

    test "schedules mailer with unread message notifications" do
      message_notification = create(:message_notification)
      member = message_notification.organization_membership

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [], [message_notification]])
    end

    test "does not schedule mailer with read message notifications" do
      message_notification = create(:message_notification)
      member = message_notification.organization_membership
      message_notification.message_thread_membership.update!(last_read_at: message_notification.message.created_at + 1.minute)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_emails 0
    end

    test "only includes message notifications if post activity preference disabled" do
      member = create(:organization_membership)
      member.user.find_or_initialize_preference(:email_notifications).update!(value: "disabled")
      message_notification = create(:message_notification, organization_membership: member)
      post = create(:post, organization: member.organization)
      event = post.events.created_action.first!
      _post_notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [], [message_notification]])
    end

    test "only includes post activity if message notifications preference disabled" do
      member = create(:organization_membership)
      member.user.find_or_initialize_preference(:message_email_notifications).update!(value: "disabled")
      _message_notification = create(:message_notification, organization_membership: member)
      post = create(:post, organization: member.organization)
      event = post.events.created_action.first!
      post_notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

      UserNotificationsEmailJob.new.perform(member.user.id)

      assert_enqueued_email_with(OrganizationMailer, :bundled_notifications, args: [member.user, member.organization, [post_notification], []])
    end
  end
end
