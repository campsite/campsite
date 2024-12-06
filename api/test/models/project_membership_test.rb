# frozen_string_literal: true

require "test_helper"

class ProjectMembershipTest < ActiveSupport::TestCase
  describe "#destroy!" do
    test "enqueues Pusher event" do
      project_membership = create(:project_membership)
      project_membership.destroy!
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [project_membership.organization_membership.user.channel_name, "project-memberships-stale", nil.to_json])
    end

    test "no-op organization membership has already been destroyed" do
      project_membership = create(:project_membership)
      project_membership.organization_membership.destroy!

      assert_nothing_raised do
        project_membership.destroy!
      end
    end
  end

  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @creator = create(:organization_membership, organization: @org)
    end

    test "added to project" do
      project = create(:project, :archived, organization: @org, creator: @creator)
      project_membership = create(:project_membership, organization_membership: @notified, project: project)
      event = create(:event, subject: project_membership, actor: @creator)
      notification = create(:notification, :subject_archived, organization_membership: @notified, event: event, target: project)

      summary = project_membership.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} added you to #{project.name}", summary.text
      assert_equal "#{@creator.display_name} added you to <#{project.url}|#{project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " added you to " } },
        { text: { content: project.name, bold: true } },
      ],
        summary.blocks
    end

    test "added to private project" do
      project = create(:project, :private, :archived, organization: @org, creator: @creator)
      project_membership = create(:project_membership, organization_membership: @notified, project: project)
      event = create(:event, subject: project_membership, actor: @creator)
      notification = create(:notification, :subject_archived, organization_membership: @notified, event: event, target: project)

      summary = project_membership.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} added you to 🔒 #{project.name}", summary.text
      assert_equal "#{@creator.display_name} added you to <#{project.url}|🔒 #{project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " added you to " } },
        { text: { content: "🔒 #{project.name}", bold: true } },
      ],
        summary.blocks
    end
  end

  context "#counter_culture" do
    test "increments members_count" do
      project = create(:project, members_count: 0)
      create(:project_membership, project: project)
      assert_equal 1, project.reload.members_count
    end

    test "decrements members_count on destroy" do
      project = create(:project, members_count: 0)
      membership = create(:project_membership, project: project)
      assert_equal 1, project.reload.members_count
      membership.destroy
      assert_equal 0, project.reload.members_count
    end

    test "decrements members_count on remove" do
      project = create(:project, members_count: 0)
      membership = create(:project_membership, project: project)
      assert_equal 1, project.reload.members_count
      project.remove_member!(membership.organization_membership)
      assert_equal 0, project.reload.members_count
    end

    test "increments guests_count" do
      project = create(:project, guests_count: 0)
      guest = create(:organization_membership, :guest, organization: project.organization)
      create(:project_membership, project: project, organization_membership: guest)
      assert_equal 1, project.reload.guests_count
    end

    test "decrements guests_count on destroy" do
      project = create(:project, guests_count: 0)
      guest = create(:organization_membership, :guest, organization: project.organization)
      membership = create(:project_membership, project: project, organization_membership: guest)
      assert_equal 1, project.reload.guests_count
      membership.destroy
      assert_equal 0, project.reload.guests_count
    end

    test "decrements guests_count on remove" do
      project = create(:project, guests_count: 0)
      guest = create(:organization_membership, :guest, organization: project.organization)
      membership = create(:project_membership, project: project, organization_membership: guest)
      assert_equal 1, project.reload.guests_count
      project.remove_member!(membership.organization_membership)
      assert_equal 0, project.reload.guests_count
    end
  end
end
