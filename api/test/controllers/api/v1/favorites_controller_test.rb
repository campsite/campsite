# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    class FavoritesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      include RackAttackHelper

      setup do
        @organization = create(:organization)
        @org_member = create(:organization_membership, organization: @organization)
        @user = @org_member.user
        @project_favorite = create(:favorite, organization_membership: @org_member)
        @project = @project_favorite.favoritable
        @project.update(private: true, accessory: "🤠")

        @project_favorite2 = create(:favorite, organization_membership: @org_member)
        @project2 = @project_favorite2.favoritable

        @thread_favorite = create(:favorite, :message_thread, organization_membership: @org_member)
        @thread = @thread_favorite.favoritable
      end

      context "#index" do
        test "works for an org admin" do
          # Create more favorites to ensure we're loading all favoritables of a single type in one query each
          create(:favorite, organization_membership: @org_member)
          thread = create(:message_thread)
          call = create(:call, organization: @organization, room: create(:call_room, organization: @organization, subject: thread))
          create_list(:call_peer, 2, :active, call: call)
          create(:favorite, favoritable: thread, organization_membership: @org_member)

          sign_in @user

          assert_query_count 29 do
            get organization_favorites_path(@organization.slug)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal 0, json_response[0]["position"]
          assert_equal Project.to_s, json_response[0]["favoritable_type"]
          assert_equal @project.public_id, json_response[0]["favoritable_id"]
          assert_equal @project.name, json_response[0]["name"]
          assert_equal true, json_response[0]["private"]
          assert_equal @project.accessory, json_response[0]["accessory"]

          assert_equal 1, json_response[1]["position"]
          assert_equal Project.to_s, json_response[1]["favoritable_type"]
          assert_equal @project2.public_id, json_response[1]["favoritable_id"]
          assert_equal @project2.name, json_response[1]["name"]
          assert_equal false, json_response[1]["private"]
          assert_nil json_response[1]["accessory"]

          assert_equal 2, json_response[2]["position"]
          assert_equal MessageThread.to_s, json_response[2]["favoritable_type"]
          assert_equal @thread.public_id, json_response[2]["favoritable_id"]
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_favorites_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_favorites_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        test "works for an org admin" do
          sign_in @user

          delete organization_favorite_path(@organization.slug, @project_favorite.public_id)

          assert_nil Favorite.where(public_id: @project_favorite.public_id).first
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          delete organization_favorite_path(@organization.slug, @project_favorite.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_favorite_path(@organization.slug, @project_favorite.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
