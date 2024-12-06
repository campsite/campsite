# frozen_string_literal: true

require "test_helper"

class GenerateCallTitleJobTest < ActiveJob::TestCase
  context "perform" do
    test "sets title and status" do
      recording = create(:call_recording, :with_transcription)

      OpenAI::Client.any_instance.expects(:chat).returns({ "choices" => [{ "message" => { "content" => "Foo Bar" } }] })

      GenerateCallTitleJob.new.perform(recording.call.id)

      assert_equal "Foo Bar", recording.call.reload.generated_title
      assert_equal "completed", recording.call.generated_title_status
    end

    test "leaves title nil and sets status when formatted transcript is blank" do
      recording = create(:call_recording)

      GenerateCallTitleJob.new.perform(recording.call.id)

      assert_nil recording.call.reload.generated_title
      assert_equal "completed", recording.call.generated_title_status
    end
  end
end
