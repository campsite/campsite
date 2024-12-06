# frozen_string_literal: true

require "test_helper"

module DemoOrgs
  class GeneratorTest < ActiveSupport::TestCase
    context "run" do
      test "creates a demo organization" do
        create(:oauth_application, :zapier)

        generator = DemoOrgs::Generator.new
        generator.update_content

        users_count = generator.users_data.size
        posts_count = generator.posts_data.size
        threads_count = generator.threads_data.size
        notes_count = generator.notes_data.size
        calls_count = generator.calls_data.size
        recordings_count = generator.calls_data.map { |c| c["recordings"].size }.sum
        comments_count = generator.posts_data.map { |p| (p["comments"] || []).size + (p["comments"]&.map { |c| c["replies"] || [] } || []).flatten.size }.sum
        messages_count = generator.threads_data.map { |t| (t["messages"] || []).size + (t["replies"] || []).size }.sum

        assert calls_count > 0
        assert recordings_count > 0

        org = Organization.find_by(slug: DemoOrgs::Generator::ORG_SLUG)
        org_threads = org.memberships.map { |m| m.message_threads }.flatten.uniq { |t| t.public_id }
        org_threads_count = org_threads.count
        org_messages_count = org_threads.map { |t| t.messages }.flatten.count
        org_comments_count = org.posts.map { |p| p.comments }.flatten.count

        assert_equal org.members.count + org.invitations.count, users_count
        assert_equal org.posts.count, posts_count
        assert_equal org_threads_count, threads_count
        assert_equal org.notes.count, notes_count
        assert_equal org_messages_count, messages_count
        assert_equal org_comments_count, comments_count

        calls = org.call_rooms.map { |r| r.calls }.flatten
        assert_equal calls.count, calls_count
        assert_equal calls.map { |c| c.recordings.count }.sum, recordings_count
      end
    end
  end
end
