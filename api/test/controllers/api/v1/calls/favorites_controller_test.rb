# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization
          @call_room = create(:call_room, organization: @organization)
          @call = create(:call, room: @call_room)
          create(:call_peer, organization_membership: @member, call: @call)
        end

        context "#create" do
          test "works for an org member" do
            sign_in @user
            post organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :created
            assert_response_gen_schema
            assert_equal Call.to_s, json_response["favoritable_type"]
            assert_equal @call.public_id, json_response["favoritable_id"]
            assert_equal @call.formatted_title, json_response["name"]
            assert_equal @call.url, json_response["url"]
          end

          test "does not work for a call you don't have access to" do
            sign_in create(:organization_membership, organization: @organization).user
            post organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "works for an org member" do
            sign_in @user
            delete organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :no_content
            assert_equal 0, @call.favorites.count
          end

          test "does not work for a call you don't have access to" do
            @call.favorites.create!(organization_membership: @member)

            sign_in create(:organization_membership, organization: @organization).user
            delete organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_call_favorite_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
