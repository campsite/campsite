# frozen_string_literal: true

require "test_helper"

module Backfills
  class ProjectSlackChannelIdBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @organization = create(:organization, slack_channel_id: "1")
        @admin = create(:organization_membership, organization: @organization, role_name: Role::ADMIN_NAME)
        @project = create(:project, organization: @organization, slack_channel_id: "2")
        @another_project = create(:project, organization: @organization)
        @private_project = create(:project, organization: @organization, private: true)

        @second_organization_with_no_slack_channel_id = create(:organization)
        @second_project = create(:project, organization: @second_organization_with_no_slack_channel_id)
      end

      it "updates the slack_channel_id for all projects in the organization that do not have one" do
        ProjectSlackChannelIdBackfill.run(dry_run: false)
        assert_equal "2", @project.reload.slack_channel_id
        assert_equal "1", @another_project.reload.slack_channel_id
        assert_nil @private_project.reload.slack_channel_id
      end

      it "does not updates the slack_channel_id for private projects in the organization" do
        ProjectSlackChannelIdBackfill.run(dry_run: false)
        assert_nil @private_project.reload.slack_channel_id
      end

      it "doesn't update the slack_channel_id for projects that already have a slack_channel_id" do
        ProjectSlackChannelIdBackfill.run(dry_run: false)
        assert_equal "2", @project.reload.slack_channel_id
      end

      it "doesn't update the slack_channel_id for projects in organizations with no global slack_channel_id" do
        ProjectSlackChannelIdBackfill.run(dry_run: false)
        assert_nil @second_project.reload.slack_channel_id
      end

      it "only affects organizations with the specified slug" do
        @third_organization = create(:organization, slack_channel_id: "3")
        @third_project = create(:project, organization: @third_organization)
        ProjectSlackChannelIdBackfill.run(dry_run: false, organization_slug: @organization.slug)
        assert_nil @third_project.reload.slack_channel_id
      end

      it "does not send notifications" do
        assert_no_difference("Notification.count") do
          ProjectSlackChannelIdBackfill.run(dry_run: false)
        end
      end
    end
  end
end
