# frozen_string_literal: true

require "test_helper"

class DurationFormatterTest < ActiveSupport::TestCase
  context "#format" do
    test "0 seconds" do
      assert_equal "0s", DurationFormatter.new(in_seconds: 0).format
    end

    test "4 seconds" do
      assert_equal "0s", DurationFormatter.new(in_seconds: 4).format
    end

    test "5 seconds" do
      assert_equal "10s", DurationFormatter.new(in_seconds: 5).format
    end

    test "14 seconds" do
      assert_equal "10s", DurationFormatter.new(in_seconds: 14).format
    end

    test "15 seconds" do
      assert_equal "20s", DurationFormatter.new(in_seconds: 15).format
    end

    test "54 seconds" do
      assert_equal "50s", DurationFormatter.new(in_seconds: 54).format
    end

    test "55 seconds" do
      assert_equal "1m", DurationFormatter.new(in_seconds: 55).format
    end

    test "1 minute" do
      assert_equal "1m", DurationFormatter.new(in_seconds: 60).format
    end

    test "59 minutes" do
      assert_equal "59m", DurationFormatter.new(in_seconds: 59.minutes).format
    end

    test "1 hour" do
      assert_equal "1h", DurationFormatter.new(in_seconds: 1.hour).format
    end

    test "1 hour 59 minutes" do
      assert_equal "1h 59m", DurationFormatter.new(in_seconds: 1.hour + 59.minutes).format
    end

    test "2 hours" do
      assert_equal "2h", DurationFormatter.new(in_seconds: 2.hours).format
    end
  end
end
