# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ImageUrlsControllerTest < ActionDispatch::IntegrationTest
      context "#create" do
        test "returns image URLs for the given file path" do
          post image_urls_path(file_path: "test.jpg")

          assert_response :ok
          assert_response_gen_schema
          assert_equal "http://campsite-test.imgix.net/test.jpg", json_response["original_url"]
          assert_equal "http://campsite-test.imgix.net/test.jpg?auto=compress%2Cformat&dpr=2&q=60&w=112", json_response["thumbnail_url"]
          assert_equal "http://campsite-test.imgix.net/test.jpg?auto=compress%2Cformat&dpr=2&q=80&w=800", json_response["feed_url"]
          assert_equal "http://campsite-test.imgix.net/test.jpg?auto=compress%2Cformat&dpr=2&q=75&w=1200", json_response["slack_url"]
          assert_equal "http://campsite-test.imgix.net/test.jpg?auto=compress%2Cformat&dpr=2&q=90&w=1440", json_response["large_url"]
        end

        test "returns input for blob URLs" do
          post image_urls_path(file_path: "blob://foobar")

          assert_response :ok
          assert_response_gen_schema
          assert_equal "blob://foobar", json_response["original_url"]
          assert_equal "blob://foobar", json_response["thumbnail_url"]
          assert_equal "blob://foobar", json_response["feed_url"]
          assert_equal "blob://foobar", json_response["slack_url"]
          assert_equal "blob://foobar", json_response["large_url"]
        end

        test "returns input for data URLs" do
          post image_urls_path(file_path: "data://foobar")

          assert_response :ok
          assert_response_gen_schema
          assert_equal "data://foobar", json_response["original_url"]
          assert_equal "data://foobar", json_response["thumbnail_url"]
          assert_equal "data://foobar", json_response["feed_url"]
          assert_equal "data://foobar", json_response["slack_url"]
          assert_equal "data://foobar", json_response["large_url"]
        end

        test "returns imgix URLs for SVGs" do
          post image_urls_path(file_path: "test.svg")

          assert_response :ok
          assert_response_gen_schema
          assert_equal "http://campsite-test.imgix.net/test.svg", json_response["original_url"]
          assert_equal "http://campsite-test.imgix.net/test.svg?auto=compress%2Cformat&dpr=2&q=60&w=112", json_response["thumbnail_url"]
          assert_equal "http://campsite-test.imgix.net/test.svg?auto=compress%2Cformat&dpr=2&q=80&w=800", json_response["feed_url"]
          assert_equal "http://campsite-test.imgix.net/test.svg?auto=compress%2Cformat&dpr=2&q=75&w=1200", json_response["slack_url"]
          assert_equal "http://campsite-test.imgix.net/test.svg?auto=compress%2Cformat&dpr=2&q=90&w=1440", json_response["large_url"]
        end

        test "gracefully handles missing file path" do
          post image_urls_path

          assert_response :unprocessable_entity
          assert_equal "missing file_path", json_response["message"]
        end
      end
    end
  end
end
