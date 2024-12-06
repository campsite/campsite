# frozen_string_literal: true

require "test_helper"

class PermissionTest < ActiveSupport::TestCase
  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @creator = create(:organization_membership, organization: @org)
    end

    test "project" do
      project = create(:project, :private, organization: @org, creator: @creator)
      create(:project_membership, organization_membership: @notified, project: project)
      permission = create(:permission, user: @notified.user, subject: project)
      event = create(:event, subject: permission)
      notification = create(:notification, organization_membership: @notified, event: event, target: project)

      summary = permission.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} added you to 🔒 #{project.name}", summary.text
      assert_equal "#{@creator.display_name} added you to <#{project.url}|🔒 #{project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " added you to " } },
        { text: { content: "🔒 #{project.name}", bold: true } },
      ],
        summary.blocks
    end

    test "note" do
      note = create(:note, member: @creator)
      permission = create(:permission, user: @notified.user, subject: note)
      event = create(:event, subject: permission)
      notification = create(:notification, organization_membership: @notified, event: event, target: note)

      summary = permission.notification_summary(notification: notification)

      assert_equal "#{@creator.display_name} shared #{note.title} with you", summary.text
      assert_equal "#{@creator.display_name} shared <#{note.url}|#{note.title}> with you", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @creator.display_name, bold: true } },
        { text: { content: " shared " } },
        { text: { content: note.title, bold: true } },
        { text: { content: " with you" } },
      ],
        summary.blocks
    end
  end
end
