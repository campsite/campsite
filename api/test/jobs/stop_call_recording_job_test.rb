# frozen_string_literal: true

require "test_helper"

class StopCallRecordingJobTest < ActiveJob::TestCase
  before(:each) do
    @call = create(:call)
  end

  context "perform" do
    test "stops recording" do
      HmsClient.any_instance.expects(:stop_recording_for_room).with(@call.remote_room_id)

      StopCallRecordingJob.new.perform(@call.id)
    end

    test "no-op if call does not have a recording" do
      HmsClient.any_instance.expects(:stop_recording_for_room).raises(Faraday::ResourceNotFound)

      assert_nothing_raised do
        StopCallRecordingJob.new.perform(@call.id)
      end
    end

    test "no-op if recording already stopping" do
      HmsClient.any_instance.expects(:stop_recording_for_room).raises(Faraday::BadRequestError)

      assert_nothing_raised do
        StopCallRecordingJob.new.perform(@call.id)
      end
    end
  end
end
