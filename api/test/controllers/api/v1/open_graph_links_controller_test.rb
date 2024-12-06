# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OpenGraphLinksControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization, :pro)
        @user = create(:organization_membership, organization: @organization).user
      end

      context "#show" do
        test "creates a new OpenGraphLink if one doesn't exist" do
          sign_in @user

          VCR.use_cassette("open_graph_links/success") do
            get open_graph_links_path(url: "https://www.example.com")
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal 1, OpenGraphLink.count
          assert_equal "https://www.example.com", OpenGraphLink.first.url
        end

        test "returns an existing OpenGraphLink if one exists" do
          sign_in @user

          create(:open_graph_link, url: "https://www.example.com")
          get open_graph_links_path(url: "https://www.example.com")

          assert_response :ok
          assert_response_gen_schema
          assert_equal 1, OpenGraphLink.count
          assert_equal "https://www.example.com", OpenGraphLink.first.url
        end

        test "fails on invalid URL" do
          Faraday::Connection.any_instance.stubs(:get).raises(Faraday::ConnectionFailed, "Failed to open TCP connection to example.com:80 (getaddrinfo: nodename nor servname provided, or not known)")

          sign_in @user
          get open_graph_links_path(url: "https://www.example.nonexistent")

          assert_response :unprocessable_entity
        end

        test "returns 422 if URL returns something other than HTML" do
          sign_in @user

          VCR.use_cassette("open_graph_links/not_html") do
            get open_graph_links_path(url: "https://github.com/campsite/campsite/actions/runs/6801021881")
          end

          assert_response :unprocessable_entity
        end
      end
    end
  end
end
