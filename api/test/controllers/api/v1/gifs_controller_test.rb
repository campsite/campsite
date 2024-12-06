# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class GifsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @member = create(:organization_membership, organization: @organization)
        @user = @member.user
        @tenor_search_response = Tenor::GifNodes.new({
          "next" => "0x123",
          "results" => [
            {
              "id" => "1",
              "content_description" => "grogu",
              "url" => "https://tenor.com/grogu.gif",
              "media_formats" => {
                "tinygif" => { "url" => "https://tenor.com/grogu.mp4", "dims" => [100, 100] },
              },
            },
            {
              "id" => "2",
              "content_description" => "baby yoda",
              "url" => "https://tenor.com/baby-yoda.gif",
              "media_formats" => {
                "tinygif" => { "url" => "https://tenor.com/baby-yoda.mp4", "dims" => [100, 100] },
              },
            },
          ],
        })
      end

      context "#index" do
        test "returns gifs for org admin" do
          TenorClient.any_instance.expects(:search).returns(@tenor_search_response)

          sign_in @user

          get organization_gifs_path(@organization.slug, params: { q: "grogu" })

          assert_response :ok
          assert_response_gen_schema
          assert json_response["next_cursor"].present?
          assert_equal 2, json_response["data"].length
        end

        test "returns gifs for org member" do
          TenorClient.any_instance.expects(:search).returns(@tenor_search_response)

          sign_in create(:organization_membership, :member, organization: @organization).user

          get organization_gifs_path(@organization.slug, params: { q: "grogu" })

          assert_response :ok
          assert_response_gen_schema
          assert json_response["next_cursor"].present?
          assert_equal 2, json_response["data"].length
        end

        test "returns featured gifs when no query is provided" do
          TenorClient.any_instance.expects(:featured).returns(@tenor_search_response)

          sign_in @user

          get organization_gifs_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert json_response["next_cursor"].present?
          assert_equal 2, json_response["data"].length
        end

        test "returns featured gifs when query is blank" do
          TenorClient.any_instance.expects(:featured).returns(@tenor_search_response)

          sign_in @user

          get organization_gifs_path(@organization.slug, params: { q: "" })

          assert_response :ok
          assert_response_gen_schema
          assert json_response["next_cursor"].present?
          assert_equal 2, json_response["data"].length
        end

        test "query count" do
          TenorClient.any_instance.expects(:search).returns(@tenor_search_response)

          sign_in @user

          assert_query_count 2 do
            get organization_gifs_path(@organization.slug, params: { q: "grogu" })
          end
        end

        test "return 403 for a random user" do
          sign_in create(:user)

          get organization_gifs_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_gifs_path(@organization.slug)

          assert_response :unauthorized
        end
      end
    end
  end
end
