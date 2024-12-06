# frozen_string_literal: true

require "test_helper"

class HmsClientTest < ActiveSupport::TestCase
  setup do
    @client = HmsClient.new(app_access_key: Rails.application.credentials.dig(:hms, :app_access_key), app_secret: Rails.application.credentials.dig(:hms, :app_secret))
  end

  describe "#create_room" do
    test "returns an Hms::Room" do
      VCR.use_cassette("hms/create_room") do
        result = @client.create_room
        assert_predicate result.id, :present?
      end
    end
  end

  describe "#stop_recording_for_room" do
    test "stops recording for a room with an active recording" do
      VCR.use_cassette("hms/stop_recording_for_room") do
        result = @client.stop_recording_for_room("658f4f90dc4b58e3133c284d")
        assert_equal "stopping", result.body["data"].first["status"]
      end
    end

    test "raises Faraday::ResourceNotFound if no active recording" do
      VCR.use_cassette("hms/stop_recording_for_room_no_active_recording") do
        assert_raises Faraday::ResourceNotFound do
          @client.stop_recording_for_room("658f4f90dc4b58e3133c284d")
        end
      end
    end
  end
end
