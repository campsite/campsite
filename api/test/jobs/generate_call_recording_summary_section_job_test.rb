# frozen_string_literal: true

require "test_helper"

class GenerateCallRecordingSummarySectionJobTest < ActiveJob::TestCase
  setup do
    vtt = <<~VTT
      WEBVTT

      00:00:00.000 --> 00:00:00.000
      Jane Doe: What should we have for breakfast today?

      00:00:00.000 --> 00:00:00.000
      John Smith: I would love to have some pancakes.

      00:00:00.000 --> 00:00:00.000
      Spongebob Squarepants: I love pancakes, John, but I'm craving some Krabby Patties.

      00:00:00.000 --> 00:00:00.000
      John Smith: I'm down for some Krabby Patties too.

      00:00:00.000 --> 00:00:00.000
      Jane Doe: Then it's decided, Krabby Patties it is!
    VTT
    earlier_recording = create(:call_recording)
    @recording = create(:call_recording, :with_transcription, call: earlier_recording.call, transcription_vtt: vtt)
    @chat_link = create(:call_recording_chat_link, call_recording: @recording)
    members = create_list(:organization_membership, 3, organization: @recording.call.room.organization)
    members.each do |member|
      create(:call_peer, call: @recording.call, organization_membership: member)
    end
  end

  context "perform" do
    test "sets status to success" do
      @recording.create_pending_summary_sections!
      first_section = @recording.summary_sections.first

      assert_predicate first_section, :pending?

      VCR.use_cassette("jobs/generate_call_recording_summary_section") do
        GenerateCallRecordingSummarySectionJob.new.perform(first_section.id)
      end

      assert_not first_section.reload.pending?
      assert_not first_section.failed?
      assert first_section.success?

      assert_enqueued_sidekiq_jobs(0, only: PusherTriggerJob)
    end

    test "updates call summary sends stale event when other sections are finished" do
      @recording.create_pending_summary_sections!
      first_section = @recording.summary_sections.first
      @recording.summary_sections.excluding(first_section).update_all(status: :success)

      assert first_section.pending?

      VCR.use_cassette("jobs/generate_call_recording_summary_section") do
        GenerateCallRecordingSummarySectionJob.new.perform(first_section.id)
      end

      assert_equal [@recording.summary_html, @recording.call.links_shared_html].join, @recording.call.reload.summary
      assert_not_predicate @recording.call, :processing_generated_summary?
      assert first_section.reload.success?
      assert @recording.call.peers.any?
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
        @recording.call.channel_name,
        "call-stale",
        {}.to_json,
      ])
    end
  end
end
