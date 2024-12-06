# frozen_string_literal: true

require "test_helper"

class UserPostDigestNotificationJobTest < ActiveJob::TestCase
  context "perform" do
    test "noop for an org without posts" do
      user = create(:organization_membership).user
      notification = user.scheduled_notifications.find_by(name: :daily_digest)

      assert_no_enqueued_emails do
        UserPostDigestNotificationJob.new.perform(notification.id)
      end
    end

    test "noop for destroyed notification" do
      user = create(:organization_membership).user
      notification = user.scheduled_notifications.find_by(name: :daily_digest)
      id = notification.id
      notification.destroy!

      assert_no_enqueued_emails do
        UserPostDigestNotificationJob.new.perform(id)
      end
    end

    context "daily digest" do
      test "sends a digest email for an org with posts in a joined project" do
        member = create(:organization_membership)
        member_2 = create(:organization_membership)
        org = member.organization
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        post = create(:post, organization: org, member: member_2)
        create(:project_membership, project: post.project, organization_membership: member)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :daily_digest, args: [
          member,
          [post],
        ]
      end

      test "does not send a digest email for an org with posts other project" do
        member = create(:organization_membership)
        member_2 = create(:organization_membership)
        org = member.organization
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        post = create(:post, organization: org, member: member_2)

        UserPostDigestNotificationJob.new.perform(notification.id)

        refute_enqueued_email_with OrganizationMailer, :daily_digest, args: [
          member,
          [post],
        ]
      end

      test "noop when only users own posts" do
        Flipper.enable("unseen_digest")
        member = create(:organization_membership)
        user = member.user
        org = member.organization
        notification = user.scheduled_notifications.find_by(name: :daily_digest)
        create(:post, organization: org, member: member)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end

      test "noop user has seen all posts" do
        Flipper.enable("unseen_digest")
        member = create(:organization_membership)
        member_2 = create(:organization_membership)
        org = member.organization
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        post = create(:post, organization: org, member: member_2).post
        post.views.build(member: member).save!

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end

      test "includes posts in private projects the user is a member of" do
        member = create(:organization_membership)
        org = member.organization
        project = create(:project, private: true, organization: org)
        create(:project_membership, organization_membership: member, project: project)
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        post = create(:post, project: project, organization: org)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :daily_digest, args: [
          member,
          [post],
        ]
      end

      test "excludes posts in private projects the user is not a member of" do
        member = create(:organization_membership)
        org = member.organization
        project = create(:project, private: true, organization: org)
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        create(:post, project: project, organization: org)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end

      test "excludes posts that are not published" do
        member = create(:organization_membership)
        user = member.user
        org = member.organization
        notification = user.scheduled_notifications.find_by(name: :daily_digest)
        create(:post, :draft, organization: org, member: member)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end

      test "does not send a digest email after leaving an org" do
        member = create(:organization_membership)
        member_2 = create(:organization_membership)
        org = member.organization
        notification = member.user.scheduled_notifications.find_by(name: :daily_digest)
        create(:post, organization: org, member: member_2)

        member.discard

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end
    end

    context "weekly digest" do
      test "sends a digest email for an org with posts" do
        member = create(:organization_membership)
        user = member.user
        org = member.organization
        notification = user.scheduled_notifications.find_by(name: :weekly_digest)
        post = create(:post, organization: org, member: member)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :weekly_digest, args: [
          member,
          [post],
          [post.project],
        ]
      end

      test "include recently created projects alongside posts" do
        member = create(:organization_membership)
        user = member.user
        org = member.organization
        project = create(:project, organization: org, created_at: 1.day.ago)
        notification = user.scheduled_notifications.find_by(name: :weekly_digest)
        post = create(:post, organization: org, member: member, project: project)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :weekly_digest, args: [
          member,
          [post],
          [project],
        ]
      end

      test "sends a digest with recently created projects when there are no posts" do
        member = create(:organization_membership)
        user = member.user
        org = member.organization
        project = create(:project, organization: org, created_at: 1.day.ago)
        notification = user.scheduled_notifications.find_by(name: :weekly_digest)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :weekly_digest, args: [
          member,
          [],
          [project],
        ]
      end

      test "includes private projects and posts in private projects the user is a member of" do
        member = create(:organization_membership)
        org = member.organization
        project = create(:project, private: true, organization: org)
        create(:project_membership, organization_membership: member, project: project)
        notification = member.user.scheduled_notifications.find_by(name: :weekly_digest)
        post = create(:post, project: project, organization: org)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :weekly_digest, args: [
          member,
          [post],
          [project],
        ]
      end

      test "excludes posts in private projects the user is not a member of" do
        member = create(:organization_membership)
        org = member.organization
        project = create(:project, private: true, organization: org)
        notification = member.user.scheduled_notifications.find_by(name: :weekly_digest)
        create(:post, project: project, organization: org)

        assert_no_enqueued_emails do
          UserPostDigestNotificationJob.new.perform(notification.id)
        end
      end

      test "excludes posts that are not published" do
        member = create(:organization_membership)
        org = member.organization
        project = create(:project, organization: org)
        notification = member.user.scheduled_notifications.find_by(name: :weekly_digest)
        create(:post, :draft, project: project, organization: org)

        UserPostDigestNotificationJob.new.perform(notification.id)

        assert_enqueued_email_with OrganizationMailer, :weekly_digest, args: [
          member,
          [],
          [project],
        ]
      end
    end
  end
end
