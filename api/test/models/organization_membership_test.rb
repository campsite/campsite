# frozen_string_literal: true

require "test_helper"

class OrganizationMembershipTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  context "#kept_published_posts" do
    test "returns posts created by the member associated to their current org" do
      user = create(:user)
      campsite_membership = create(:organization_membership, user: user)
      hogwarts_membership = create(:organization_membership, user: user)

      # create post for campsite org
      campsite_post = create(:post, member: campsite_membership, organization: campsite_membership.organization)
      create(:post, :draft, member: campsite_membership, organization: campsite_membership.organization)

      assert_equal [campsite_post], campsite_membership.kept_published_posts
      assert_empty hogwarts_membership.kept_published_posts
    end
  end

  context "#discard" do
    test "destroys subscriptions related to the org" do
      membership = create(:organization_membership)
      create(:post, member: membership, organization: membership.organization)
      assert_not_empty membership.organization.post_subscriptions

      membership.discard!

      assert_empty membership.organization.post_subscriptions
    end
  end

  context ".inbox_notifications" do
    test "returns only the most recent notification for each target" do
      org = create(:organization)
      member_1 = create(:organization_membership, organization: org)
      member_2 = create(:organization_membership, organization: org)
      post = create(:post, organization: org)
      older_comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(member_1)} #{MentionsFormatter.format_mention(member_2)}</p>")
      Timecop.travel(5.minutes.ago) do
        older_comment.events.first.process!
      end
      newer_comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(member_1)} #{MentionsFormatter.format_mention(member_2)}</p>")
      newer_comment.events.first.process!

      assert_equal 2, member_1.notifications.count
      assert_includes member_1.notifications.map(&:subject), older_comment
      assert_includes member_1.notifications.map(&:subject), newer_comment
      assert_equal 1, member_1.inbox_notifications.count
      assert_not_includes member_1.inbox_notifications.map(&:subject), older_comment
      assert_includes member_1.inbox_notifications.map(&:subject), newer_comment

      assert_equal 2, member_2.notifications.count
      assert_includes member_2.notifications.map(&:subject), older_comment
      assert_includes member_2.notifications.map(&:subject), newer_comment
      assert_equal 1, member_2.inbox_notifications.count
      assert_not_includes member_2.inbox_notifications.map(&:subject), older_comment
      assert_includes member_2.inbox_notifications.map(&:subject), newer_comment
    end

    test "includes an older notification when the most recent notification is discarded" do
      org = create(:organization)
      member = create(:organization_membership, organization: org)
      post = create(:post, organization: org)
      older_comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
      Timecop.travel(5.minutes.ago) do
        older_comment.events.first.process!
      end
      newer_comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
      newer_comment.events.first.process!
      newer_comment.notifications.find_by(organization_membership: member).discard

      assert_equal 1, member.inbox_notifications.count
      assert_includes member.inbox_notifications.map(&:subject), older_comment
      assert_not_includes member.inbox_notifications.map(&:subject), newer_comment
    end
  end

  context "#userlist_proprerties" do
    test "includes role name" do
      membership = build(:organization_membership, :viewer)

      assert_equal "viewer", membership.userlist_properties[:role]
    end
  end

  context "#update!" do
    test "when role changes, updates projects guests_count and members_count" do
      membership = create(:organization_membership, :guest)
      project = create(:project, organization: membership.organization)
      project.add_member!(membership)

      assert_equal 1, project.reload.guests_count
      assert_equal 0, project.members_count
      assert_equal 1, project.members_and_guests_count

      membership.update!(role_name: Role::MEMBER_NAME)

      assert_equal 0, project.reload.guests_count
      assert_equal 1, project.members_count
      assert_equal 1, project.members_and_guests_count
    end
  end

  context "#export_json" do
    test "exports metadata" do
      membership = create(:organization_membership, user: create(:user, username: "username456", name: "Harry Potter", email: "username456@example.com"), role_name: "admin")
      expected_json = {
        id: membership.public_id,
        username: "username456",
        display_name: "Harry Potter",
        email: "username456@example.com",
        created_at: membership.created_at,
        role: "admin",
        deactivated: false,
      }
      assert_equal expected_json, membership.export_json
    end
  end
end
