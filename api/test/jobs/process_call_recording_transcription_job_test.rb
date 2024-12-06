# frozen_string_literal: true

require "test_helper"

class ProcessCallRecordingTranscriptionJobTest < ActiveJob::TestCase
  before(:each) do
    @recording = create(:call_recording, transcript_srt_file_path: "prefix/<transcript-srt-address>.srt")
    @message = create(:message, call: @recording.call)
    @call_member = @recording.call.subject.organization_memberships.first
    @call_peer = create(:call_peer, name: "Alexandru Ţurcanu", call: @recording.call, organization_membership: @call_member)
    @transcript_srt = "1\n00:00:00,000 --> 00:00:01,000\n#{@call_peer.name}: Hello world!"
  end

  context "perform" do
    test "updates CallRecording and triggers client updates" do
      stub_downloaded_transcript(@transcript_srt)

      ProcessCallRecordingTranscriptionJob.new.perform(@recording.id)

      assert_equal "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\n#{@call_peer.name}: Hello world!", @recording.reload.transcription_vtt
      assert_equal 1, @recording.speakers.count
      assert_equal @call_peer.name, @recording.speakers.first.name
      assert_equal @call_peer, @recording.speakers.first.call_peer
      assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@call_member.user.channel_name, "call-recording-transcription-stale", { org_slug: @call_member.organization.slug, call_recording_id: @recording.public_id }.to_json])

      assert_equal CallRecordingSummarySection.sections.count, @recording.summary_sections.count
      assert_enqueued_sidekiq_job(GenerateCallRecordingSummarySectionJob, args: [@recording.summary_sections[0].id])
      assert_enqueued_sidekiq_job(GenerateCallTitleJob, args: [@recording.call.id])
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@recording.call.channel_name, "recording-stale", { call_recording_id: @recording.public_id }.to_json])
      assert_predicate @recording.call, :processing_generated_summary?
    end

    test "creates speakers for logged-out callers" do
      stub_downloaded_transcript(@transcript_srt)
      @call_member.destroy!

      ProcessCallRecordingTranscriptionJob.new.perform(@recording.id)

      assert_equal "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\n#{@call_peer.name}: Hello world!", @recording.reload.transcription_vtt
      assert_equal 1, @recording.speakers.count
      assert_equal @call_peer.name, @recording.speakers.first.name
      assert_equal @call_peer, @recording.speakers.first.call_peer
      assert_enqueued_sidekiq_job(GenerateCallTitleJob, args: [@recording.call.id])
      assert_predicate @recording.call, :processing_generated_summary?
    end

    test "enqueues GenerateCallTitleJob and marks generated summary as processed when transcript is blank" do
      stub_downloaded_transcript("")

      ProcessCallRecordingTranscriptionJob.new.perform(@recording.id)

      assert_nil @recording.reload.transcription_vtt
      assert_equal 0, @recording.speakers.count
      assert_enqueued_sidekiq_job(GenerateCallTitleJob, args: [@recording.call.id])
      assert_not_predicate @recording.call, :processing_generated_summary?
    end
  end

  def stub_downloaded_transcript(content)
    Down.expects(:download).with("#{Rails.application.credentials.imgix.url}/prefix/<transcript-srt-address>.srt").returns(stub(read: content))
  end
end
