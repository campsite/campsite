# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Notes
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @note = create(:note, member: create(:organization_membership, organization: @organization))
        end

        context "#create" do
          test "works for an org member" do
            project = create(:project, organization: @organization)
            @note.add_to_project!(project: project)

            sign_in @user
            post organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :created
            assert_response_gen_schema
            assert_equal Note.to_s, json_response["favoritable_type"]
            assert_equal @note.public_id, json_response["favoritable_id"]
            assert_equal @note.title, json_response["name"]
            assert_equal @note.url, json_response["url"]
          end

          test "does not work for a note you don't have access to" do
            sign_in @user
            post organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "works for an org member" do
            project = create(:project, organization: @organization)
            @note.add_to_project!(project: project)
            @note.favorites.create!(organization_membership: @member)

            sign_in @user
            delete organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :no_content
            assert_equal 0, @note.favorites.count
          end

          test "does not work for a note you don't have access to" do
            @note.favorites.create!(organization_membership: @member)

            sign_in @user
            delete organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_note_favorite_path(@organization.slug, @note.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
