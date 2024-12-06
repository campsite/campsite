# frozen_string_literal: true

require "test_helper"

class ProductLogsJobTest < ActiveJob::TestCase
  context "perform" do
    test "it queues multiple user events" do
      user = create(:user)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal user, sample.subject
    end

    test "it queues multiple org events" do
      org = create(:organization)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", org_slug: org.slug },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", org_slug: org.slug },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", org_slug: org.slug },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal org, sample.subject
    end

    test "it queues multiple org events by org_id" do
      org = create(:organization)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", org_id: org.public_id },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", org_id: org.public_id },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", org_id: org.public_id },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal org, sample.subject
    end

    test "it queues multiple member events" do
      member = create(:organization_membership)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_slug: member.organization.slug },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_slug: member.organization.slug },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_slug: member.organization.slug },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal member, sample.subject
    end

    test "it queues user events when no member exists for user_id and org_slug" do
      user = create(:user)
      organization = create(:organization)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id, org_slug: organization.slug },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id, org_slug: organization.slug },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: user.public_id, org_slug: organization.slug },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal user, sample.subject
    end

    test "it queues multiple member events by org_id" do
      member = create(:organization_membership)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_id: member.organization.public_id },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_id: member.organization.public_id },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_id: member.organization.public_id },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "", "{}")
      end

      sample = ProductLog.find_by(name: "test")
      assert_equal "bar", sample.data["foo"]
      assert_equal member, sample.subject
    end

    test "it handles mixed events with user agent" do
      member = create(:organization_membership)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd", org_slug: member.organization.slug },
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_slug: member.organization.slug },
      ]

      assert_difference -> { ProductLog.count }, 3 do
        ProductLogsJob.new.perform(events.as_json, "Foo Bar Campsite/123.0.1 Dog Cat", "{}")
      end

      user_log = ProductLog.find_by(name: "test")
      assert_equal member.user, user_log.subject
      assert user_log.device_info["is_desktop_app"]
      assert_equal "123.0.1", user_log.device_info["desktop_app_version"]

      org_log = ProductLog.find_by(name: "test_test")
      assert_equal member.organization, org_log.subject
      assert user_log.device_info["is_desktop_app"]
      assert_equal "123.0.1", user_log.device_info["desktop_app_version"]

      member_log = ProductLog.find_by(name: "testing")
      assert_equal member, member_log.subject
      assert user_log.device_info["is_desktop_app"]
      assert_equal "123.0.1", user_log.device_info["desktop_app_version"]
    end

    test "it allows nil subject" do
      member = create(:organization_membership)
      events = [
        { name: "test", data: { foo: "bar" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id },
        { name: "test_test", data: { foo: "baz" }, log_ts: Time.current.to_i, session_id: "abcd" },
      ]

      assert_difference -> { ProductLog.count }, 2 do
        ProductLogsJob.new.perform(events.as_json, "Foo Bar Campsite/123.0.1 Dog Cat", "{}")
      end
    end

    test "it captures PWA" do
      member = create(:organization_membership)
      events = [
        { name: "testing", data: { foo: "cat" }, log_ts: Time.current.to_i, session_id: "abcd", user_id: member.user.public_id, org_slug: member.organization.slug },
      ]

      assert_difference -> { ProductLog.count }, 1 do
        ProductLogsJob.new.perform(events.as_json, "Foo Bar Campsite/123.0.1 Dog Cat", { "x-campsite-pwa": true }.to_json)
      end

      member_log = ProductLog.find_by(name: "testing")
      assert_equal member, member_log.subject
      assert_equal true, member_log.device_info["is_pwa"]
    end
  end
end
