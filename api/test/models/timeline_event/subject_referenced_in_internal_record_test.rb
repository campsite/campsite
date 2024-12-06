# frozen_string_literal: true

require "test_helper"

class TimelineEvent
  class SubjectReferencedInInternalRecordTest < ActiveSupport::TestCase
    setup do
      @organization = create(:organization)
    end

    test "creates timeline events for post references" do
      post_reference = create(:post, organization: @organization)
      member = post_reference.member
      post = create(:post, organization: @organization, description_html: <<-HTML
        <link-unfurl href="#{post_reference.url}"></link-unfurl>
      HTML
      )

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: member, subject: post, changes: ["", post.description_html]).sync

      assert_equal 1, post_reference.timeline_events.count
      post_reference_timeline_event = post_reference.timeline_events.first
      assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
      assert_equal post, post_reference_timeline_event.post_reference
      assert_nil post_reference_timeline_event.metadata

      assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
    end

    test "does not create timeline events for draft post references" do
      post_reference = create(:post, :draft, organization: @organization)
      member = post_reference.member
      post = create(:post, organization: @organization, description_html: <<-HTML
        <link-unfurl href="#{post_reference.url}"></link-unfurl>
      HTML
      )

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: member, subject: post, changes: ["", post.description_html]).sync

      assert_equal 0, post_reference.timeline_events.count
    end

    private

    def assert_enqueued_subject_timeline_stale_pusher_event(subject)
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
    end
  end
end
