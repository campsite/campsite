# frozen_string_literal: true

require "test_helper"

class CallRecordingTest < ActiveSupport::TestCase
  context "#formatted_transcript" do
    test "it strips transcript data from VTT" do
      vtt = <<~VTT
        WEBVTT
        00:00:00.000 --> 00:00:01.000
        Foo Bar: Hello World
      VTT
      recording = create(:call_recording, :with_transcription, transcription_vtt: vtt)
      result = recording.formatted_transcript
      assert_equal "Foo Bar: Hello World", result
    end
  end

  context "#create_pending_summary_sections" do
    test "creates sections that are all pending" do
      recording = create(:call_recording)
      sections = recording.create_pending_summary_sections!
      assert sections.all?(&:pending?)
    end
  end

  context "#summary_html" do
    test "returns nil when there are no sections" do
      recording = create(:call_recording)

      assert_nil recording.summary_html
    end

    test "gracefully handles missing sections" do
      recording = create(:call_recording)
      create(:call_recording_summary_section, call_recording: recording, section: :summary, response: "<p>This is the summary</p>")

      expected = <<~HTML.squish
        <p>This is the summary</p>
      HTML

      assert_equal expected, recording.summary_html
    end

    test "creates summary with headers in order" do
      recording = create(:call_recording)
      create(:call_recording_summary_section, call_recording: recording, section: :summary, response: "<p>This is the summary</p>")
      create(:call_recording_summary_section, call_recording: recording, section: :agenda, response: "<p>This is the agenda</p>")
      create(:call_recording_summary_section, call_recording: recording, section: :next_steps, response: "<p>Here are the next steps</p>")

      expected = <<~HTML.squish
        <p>This is the summary</p><p>This is the agenda</p><h2>Next steps</h2><p>Here are the next steps</p>
      HTML

      assert_equal expected, recording.summary_html
    end
  end
end
