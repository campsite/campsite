# frozen_string_literal: true

require "test_helper"

class HandleFlipperAuditLogJobTest < ActiveJob::TestCase
  setup do
    @staff = create(:user, :staff)
    @feature_name = "my_cool_feature"
    @feature_html = "[#{@feature_name}](http://admin.campsite.test:3001/admin/features/#{@feature_name})"
  end

  context "#perform" do
    test "posts to Campsite about a new feature added" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "add",
        result: true,
        user_id: @staff.id,
      )

      expected_text = "🚩 #{@staff.display_name} added the #{@feature_html} feature flag."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature removed" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "remove",
        result: true,
        user_id: @staff.id,
      )

      expected_text = "🗑️ #{@staff.display_name} removed the #{@feature_html} feature flag."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature fully enabled" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "boolean",
        thing: { value: true },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "✅ #{@staff.display_name} enabled the #{@feature_html} feature flag for everyone."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature fully disabled" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "disable",
        gate_name: "boolean",
        thing: { value: false },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "❌ #{@staff.display_name} disabled the #{@feature_html} feature flag for everyone."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature enabled for a user" do
      user = create(:user)
      audit_log = FlipperAuditLog.create(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "actor",
        thing: {
          thing: user,
          value: user.flipper_id,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👤 #{@staff.display_name} enabled the #{@feature_html} feature flag for #{user.display_name}."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature disabled for a user" do
      user = create(:user)
      audit_log = FlipperAuditLog.create(
        feature_name: @feature_name,
        operation: "disable",
        gate_name: "actor",
        thing: {
          thing: user,
          value: user.flipper_id,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👤 #{@staff.display_name} disabled the #{@feature_html} feature flag for #{user.display_name}."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature enabled for an organization" do
      org = create(:organization)
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "actor",
        thing: {
          thing: org,
          value: org.flipper_id,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "💼 #{@staff.display_name} enabled the #{@feature_html} feature flag for #{org.name}."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature disabled for an organization" do
      org = create(:organization)
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "disable",
        gate_name: "actor",
        thing: {
          thing: org,
          value: org.flipper_id,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "💼 #{@staff.display_name} disabled the #{@feature_html} feature flag for #{org.name}."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature enabled for a group" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "group",
        thing: {
          name: "staff",
          value: "staff",
          block: {},
          single_argument: false,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👥 #{@staff.display_name} enabled the #{@feature_html} feature flag for staff."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature disabled for a group" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "disable",
        gate_name: "group",
        thing: {
          name: "staff",
          value: "staff",
          block: {},
          single_argument: false,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👥 #{@staff.display_name} disabled the #{@feature_html} feature flag for staff."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature disabled for actor by Flipper ID" do
      user = create(:user)
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "disable",
        gate_name: "actor",
        thing: {
          thing: { flipper_id: user.flipper_id },
          value: user.flipper_id,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👤 #{@staff.display_name} disabled the #{@feature_html} feature flag for #{user.flipper_id}."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature enabled for percentage of actors" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "percentage_of_actors",
        thing: {
          value: 10,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👥 #{@staff.display_name} enabled the #{@feature_html} feature flag for 10% of users."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end

    test "posts to Campsite about a feature enabled for percentage of time" do
      audit_log = FlipperAuditLog.create!(
        feature_name: @feature_name,
        operation: "enable",
        gate_name: "percentage_of_time",
        thing: {
          value: 10,
        },
        result: true,
        user_id: @staff.id,
      )

      expected_text = "👥 #{@staff.display_name} enabled the #{@feature_html} feature flag for 10% of time."

      HandleFlipperAuditLogJob.any_instance.expects(:send_campsite_message).with(text: expected_text)

      HandleFlipperAuditLogJob.new.perform(audit_log.id)
    end
  end
end
