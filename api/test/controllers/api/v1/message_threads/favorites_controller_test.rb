# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module MessageThreads
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        include RackAttackHelper

        setup do
          @thread = create(:message_thread, :group)
          @member = @thread.owner
          @organization = @member.organization
          @user = @member.user
        end

        context "#create" do
          test "works for an org admin" do
            sign_in @user

            post organization_thread_favorites_path(@organization.slug, @thread.public_id)

            assert_response :created
            assert_response_gen_schema
            assert_equal MessageThread.to_s, json_response["favoritable_type"]
            assert_equal @thread.public_id, json_response["favoritable_id"]
          end

          test "does not work for a thread you don't have access to" do
            @thread = create(:message_thread, :group)
            sign_in @user

            post organization_thread_favorites_path(@organization.slug, @thread.public_id)

            assert_response :not_found
            assert_equal 0, @thread.favorites.count
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_thread_favorites_path(@organization.slug, @thread.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_thread_favorites_path(@organization.slug, @thread.public_id)
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "works for an org admin" do
            @thread.favorites.create!(organization_membership: @member)
            sign_in @user

            delete organization_thread_favorites_path(@organization.slug, @thread.public_id)

            assert_response :no_content

            assert_equal 0, @thread.favorites.count
          end

          test "works for a thread you have access to" do
            @thread = create(:message_thread, :group, organization_memberships: [@member])
            @thread.favorites.create!(organization_membership: @member)

            sign_in @user

            delete organization_thread_favorites_path(@organization.slug, @thread.public_id)

            assert_response :no_content
            assert_equal 0, @thread.favorites.count
          end

          test "does not work for a private project you don't have access to" do
            @thread = create(:message_thread, :group)
            @thread.favorites.create!(organization_membership: @member)
            sign_in @user

            delete organization_thread_favorites_path(@organization.slug, @thread.public_id)

            assert_response :not_found
            assert_equal 1, @thread.favorites.count
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_thread_favorites_path(@organization.slug, @thread.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_thread_favorites_path(@organization.slug, @thread.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
