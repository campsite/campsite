# frozen_string_literal: true

require "test_helper"

class ProjectTest < ActiveSupport::TestCase
  describe "#archived?" do
    test "returns true if project is archived" do
      project = build(:project, :archived)
      assert_predicate project, :archived?
    end

    test "returns false if project is not archived" do
      project = build(:project, archived_at: nil, archived_by: nil)
      assert_not_predicate project, :archived?
    end
  end

  context "#join_slack_channel!" do
    test "joins a slack channel on update with a slack channel id" do
      project = create(:project)
      project.stubs(:slack_token).returns("token")
      Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "channel_id")

      project.update_slack_channel!(id: "channel_id", is_private: false)
    end

    test "does not join a slack channel on update with a slack channel id when private" do
      project = create(:project)
      project.stubs(:slack_token).returns("token")
      Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "channel_id").never

      project.update_slack_channel!(id: "channel_id", is_private: true)
    end
  end

  context "#archive!" do
    setup do
      @org_member = create(:organization_membership)
    end

    test "archives a project" do
      project = create(:project, archived_at: nil, archived_by: nil, organization: @org_member.organization)
      assert_not_predicate project, :archived?

      project.archive!(@org_member)
      assert_predicate project, :archived?
    end
  end

  context "#unarchive!" do
    test "unarchives a project" do
      archived_project = create(:project, archived_at: Time.current)
      assert_predicate archived_project, :archived?

      archived_project.unarchive!
      assert_not_predicate archived_project, :archived?
    end
  end

  context "#build_slack_blocks" do
    test "builds Slack blocks with accessory, title, description, and contributors" do
      project = create(:project, description: "foobar", accessory: "🤩")
      contributors = create_list(:post, Project::BuildSlackBlocks::MAX_CONTRIBUTORS + 2, project: project).map(&:user)

      expected = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*<#{project.url}|#{project.accessory} #{project.name}>*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: project.description,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Contributors: #{contributors[0].display_name}, #{contributors[1].display_name}, #{contributors[2].display_name}, and 2 others",
            },
          ],
        },
      ]

      assert_equal expected, project.build_slack_blocks
    end

    test "builds Slack blocks with title and description" do
      project = create(:project, description: "foobar")

      expected = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*<#{project.url}|#{project.name}>*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: project.description,
          },
        },
      ]

      assert_equal expected, project.build_slack_blocks
    end

    test "builds Slack blocks with just title" do
      project = create(:project)

      expected = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*<#{project.url}|#{project.name}>*",
          },
        },
      ]

      assert_equal expected, project.build_slack_blocks
    end
  end

  context ".create" do
    before(:each) do
      @org = create(:organization)
      create_list(:project, 5, organization: @org)
    end

    test "you can't have a project that's both private and general" do
      project = build(:project, organization: @org, is_general: true, private: true)
      assert_not project.valid?
      assert_equal ["Private cannot be true for channels marked as general or default"], project.errors.full_messages
    end
  end

  context "#prerenders" do
    test "viewer has favorited" do
      member = create(:organization_membership)
      projects = create_list(:project, 2, organization: member.organization)
      create(:favorite, favoritable: projects[0], organization_membership: member)

      result = Project.viewer_has_favorited_async(projects.map(&:id), member).value

      assert result[projects[0].id]
      assert_not result[projects[1].id]
    end

    test "viewer has subscribed" do
      member = create(:organization_membership)
      projects = create_list(:project, 3, organization: member.organization)
      subscription_0 = create(:user_subscription, subscribable: projects[0], user: member.user, cascade: true)
      subscription_1 = create(:user_subscription, subscribable: projects[1], user: member.user)

      result = Project.viewer_subscription_async(projects.map(&:id), member).value

      assert_equal subscription_0, result[projects[0].id]
      assert_equal subscription_1, result[projects[1].id]
      assert_nil result[projects[2].id]
    end

    test "viewer recent posts count" do
      member = create(:organization_membership)
      projects = create_list(:project, 3, organization: member.organization)
      create(:post, project: projects[0], member: member, created_at: 1.day.ago)
      create(:post, project: projects[0], member: member, created_at: 1.week.ago)
      create(:post, project: projects[0], member: member, created_at: 2.months.ago)
      create(:post, project: projects[1], member: member, created_at: 6.days.ago)
      create(:post, project: projects[1], member: member, created_at: 3.months.ago)
      create(:post, project: projects[2], member: member, created_at: 6.months.ago)

      result = Project.viewer_recent_posts_count_async(projects.map(&:id), member).value

      # sort by value, descending
      result = result.sort_by { |_k, v| v }.pluck(0)
      assert_equal [projects[1], projects[0]].map(&:id), result
    end
  end

  context ".unread_for_viewer_async" do
    setup do
      @project = create(:project)
      @organization_membership = create(:organization_membership, organization: @project.organization)
    end

    test "doesn't include project if project has no posts" do
      expected = {}
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "doesn't include project if last view is more recent than last post" do
      create(:post, project: @project, created_at: 2.hours.ago)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 1.hour.ago)

      expected = {}
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "includes project if last view is older than last post" do
      create(:post, project: @project, created_at: 1.hour.ago)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 2.hours.ago)

      expected = { @project.id => true }
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "doesn't include project if user has read all posts in the project since last project view" do
      post = create(:post, project: @project, created_at: 1.hour.ago)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 2.hours.ago)
      create(:post_view, post: post, member: @organization_membership)

      expected = {}
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "includes project if user has only read some posts in the project since last project view" do
      post = create(:post, project: @project, created_at: 1.hour.ago)
      create(:post, project: @project, created_at: 1.hour.ago)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 2.hours.ago)
      create(:post_view, post: post, member: @organization_membership)

      expected = { @project.id => true }
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "doesn't consider your posts for unread" do
      create(:post, project: @project, created_at: 1.hour.ago, member: @organization_membership)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 2.hours.ago)

      expected = {}
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "doesn't consider draft posts for unread" do
      create(:post, :draft, project: @project, created_at: 1.hour.ago)
      create(:project_view, project: @project, organization_membership: @organization_membership, last_viewed_at: 2.hours.ago)

      expected = {}
      result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

      assert_equal expected, result
    end

    test "includes chat project if chat is unread" do
      Timecop.freeze do
        message_thread = create(:message_thread, :group, owner: @organization_membership)
        @project.update!(message_thread: message_thread)
        message_thread.memberships.find_by(organization_membership: @organization_membership).update!(last_read_at: 2.hours.ago)
        create(:message, message_thread: message_thread, created_at: 1.hour.ago)

        expected = { @project.id => true }
        result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

        assert_equal expected, result
      end
    end

    test "excludes chat project if chat is read" do
      Timecop.freeze do
        message_thread = create(:message_thread, :group, owner: @organization_membership)
        @project.update!(message_thread: message_thread)
        create(:message, message_thread: message_thread, created_at: 2.hours.ago)
        message_thread.memberships.find_by(organization_membership: @organization_membership).update!(last_read_at: 1.hour.ago)

        expected = {}
        result = Project.unread_for_viewer_async(@project.id, @organization_membership).value

        assert_equal expected, result
      end
    end
  end

  context "#add_member!" do
    setup do
      @org = create(:organization)
      @project = create(:project, organization: @org)
      @organization_membership = create(:organization_membership, organization: @org)
    end

    test "creates project membership" do
      project_membership = @project.add_member!(@organization_membership)

      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.subscribers, @organization_membership.user
      assert_equal 1, @project.members_count
    end

    test "creates project membership for guest" do
      guest = create(:organization_membership, :guest, organization: @org)
      project_membership = @project.add_member!(guest)

      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.subscribers, guest.user
      assert_equal 1, @project.guests_count
    end

    test "creates project membership from discarded record" do
      project_membership = @project.add_member!(@organization_membership)
      @project.remove_member!(@organization_membership)
      project_membership.reload

      assert_predicate project_membership, :discarded?
      assert_equal 0, @project.members_count

      project_membership = @project.add_member!(@organization_membership)

      assert_not_predicate project_membership, :discarded?
      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.subscribers, @organization_membership.user
      assert_equal 1, @project.members_count
    end

    test "does not explode if user already has a subscription" do
      create(:user_subscription, user: @organization_membership.user, subscribable: @project)

      project_membership = @project.add_member!(@organization_membership)

      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.subscribers, @organization_membership.user
    end

    test "does not create subscriptions for Campsite Insiders project" do
      Project.stub_const(:CAMPSITE_INSIDERS_PROD_PUBLIC_ID, @project.public_id) do
        @project.add_member!(@organization_membership)

        assert_not_includes @project.subscribers, @organization_membership.user
      end
    end
  end

  context "#add_oauth_application!" do
    setup do
      @org = create(:organization)
      @project = create(:project, organization: @org)
      @oauth_application = create(:oauth_application, owner: @org)
    end

    test "creates project membership" do
      project_membership = @project.add_oauth_application!(@oauth_application)

      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.kept_oauth_applications, @oauth_application
    end

    test "creates project membership from discarded record" do
      project_membership = @project.add_oauth_application!(@oauth_application)
      @project.remove_oauth_application!(@oauth_application)
      project_membership.reload

      assert_predicate project_membership, :discarded?
      assert_equal 0, @project.kept_oauth_applications.count

      project_membership = @project.add_oauth_application!(@oauth_application)

      assert_not_predicate project_membership, :discarded?
      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.kept_oauth_applications, @oauth_application
    end

    test "does not explode if oauth application already has a project membership" do
      create(:project_membership, oauth_application: @oauth_application, project: @project, organization_membership: nil)

      project_membership = @project.add_oauth_application!(@oauth_application)

      assert_includes @project.reload.project_memberships, project_membership
      assert_includes @project.kept_oauth_applications, @oauth_application
    end
  end

  context "#remove_member!" do
    setup do
      @org = create(:organization)
      @project = create(:project, organization: @org)
      @organization_membership = create(:organization_membership, organization: @org)
      @project_membership = @project.add_member!(@organization_membership)
    end

    test "discards project membership" do
      @project.remove_member!(@organization_membership)

      assert_predicate @project_membership.reload, :discarded?
    end

    test "discards project subscription" do
      @project.remove_member!(@organization_membership)

      assert_not @organization_membership.user.subscriptions.exists?(subscribable: @project)
    end

    test "discards project favorite" do
      create(:favorite, favoritable: @project, organization_membership: @organization_membership)
      @project.remove_member!(@organization_membership)

      assert_not @organization_membership.member_favorites.exists?(favoritable: @project)
    end
  end

  context "#remove_oauth_application!" do
    setup do
      @org = create(:organization)
      @project = create(:project, organization: @org)
      @oauth_application = create(:oauth_application, owner: @org)
      @project_membership = @project.add_oauth_application!(@oauth_application)
    end

    test "discards project membership" do
      @project.remove_oauth_application!(@oauth_application)

      assert_predicate @project_membership.reload, :discarded?
      assert_not @project.kept_oauth_applications.exists?(@oauth_application.id)
    end
  end

  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @creator = create(:organization_membership, organization: @org)
    end

    test "archived project" do
      project = create(:project, :archived, organization: @org, creator: @creator)
      create(:project_membership, organization_membership: @notified, project: project)
      event = create(:event, subject: project, actor: @creator)
      notification = create(:notification, :subject_archived, organization_membership: @notified, event: event, target: project)

      summary = project.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} archived #{project.name}", summary.text
      assert_equal "#{@creator.display_name} archived <#{project.url}|#{project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " archived " } },
        { text: { content: project.name, bold: true } },
      ],
        summary.blocks
    end

    test "archived private project" do
      project = create(:project, :private, :archived, organization: @org, creator: @creator)
      create(:project_membership, organization_membership: @notified, project: project)
      event = create(:event, subject: project, actor: @creator)
      notification = create(:notification, :subject_archived, organization_membership: @notified, event: event, target: project)

      summary = project.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} archived 🔒 #{project.name}", summary.text
      assert_equal "#{@creator.display_name} archived <#{project.url}|🔒 #{project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " archived " } },
        { text: { content: "🔒 #{project.name}", bold: true } },
      ],
        summary.blocks
    end
  end

  context "#export_json" do
    test "handles members" do
      project = create(:project)
      create_list(:project_membership, 3, project: project)
      export = project.export_json
      assert_equal 3, export[:members].count
    end
  end
end
