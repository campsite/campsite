# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class CustomReactionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
        end

        context "#index" do
          before do
            create_list(:custom_reaction, 3, organization: @organization, creator: @member)
          end

          test "returns paginated custom reactions for org admin" do
            sign_in @user

            get organization_custom_reactions_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
          end

          test "returns paginated custom reactions for org member" do
            sign_in create(:organization_membership, :member, organization: @organization).user

            get organization_custom_reactions_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
          end

          test "query count" do
            sign_in @user

            assert_query_count 4 do
              get organization_custom_reactions_path(@organization.slug)
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            get organization_custom_reactions_path(@organization.slug)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_custom_reactions_path(@organization.slug)

            assert_response :unauthorized
          end
        end

        context "#create" do
          test "creates custom reaction for an org admin" do
            assert @organization.admin?(@user)
            sign_in @user

            assert_difference -> { CustomReaction.count }, 1 do
              post organization_custom_reactions_path(@organization.slug),
                params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal "party_blob", json_response["name"]
            assert_equal "http://campsite-test.imgix.net/party_blob", json_response["file_url"]

            custom_reaction = CustomReaction.last
            assert_equal @member, custom_reaction.creator
            assert_equal "party_blob", custom_reaction.name
            assert_equal "/party_blob", custom_reaction.file_path
            assert_equal "image/png", custom_reaction.file_type
          end

          test "creates custom reaction for org member" do
            org_member = create(:organization_membership, :member, organization: @organization)
            sign_in org_member.user

            assert_difference -> { CustomReaction.count }, 1 do
              post organization_custom_reactions_path(@organization.slug),
                params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal "party_blob", json_response["name"]
            assert_equal "http://campsite-test.imgix.net/party_blob", json_response["file_url"]

            custom_reaction = CustomReaction.last
            assert_equal org_member, custom_reaction.creator
            assert_equal "party_blob", custom_reaction.name
            assert_equal "/party_blob", custom_reaction.file_path
            assert_equal "image/png", custom_reaction.file_type
          end

          test "doesn't allow viewer to create custom reactions" do
            viewer = create(:organization_membership, :viewer, organization: @organization)
            sign_in viewer.user

            assert_no_difference -> { CustomReaction.count } do
              post organization_custom_reactions_path(@organization.slug),
                params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
                as: :json

              assert_response :forbidden
            end
          end

          test "query count" do
            sign_in create(:organization_membership, :member, organization: @organization).user

            assert_query_count 8 do
              post organization_custom_reactions_path(@organization.slug),
                params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
                as: :json
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            post organization_custom_reactions_path(@organization.slug),
              params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
              as: :json

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_custom_reactions_path(@organization.slug),
              params: { name: "party_blob", file_path: "/party_blob", file_type: "image/png" },
              as: :json

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          before do
            @custom_reaction = create(:custom_reaction, organization: @organization)
          end

          test "destroys custom reaction for an org admin" do
            assert @organization.admin?(@user)
            sign_in @user

            assert_difference -> { CustomReaction.count }, -1 do
              delete organization_custom_reaction_path(@organization.slug, @custom_reaction.public_id)
            end

            assert_response :no_content
            assert_nil CustomReaction.find_by(id: @custom_reaction.id)
          end

          test "destroys custom reaction for an org member" do
            org_member = create(:organization_membership, :member, organization: @organization)
            sign_in org_member.user

            assert_difference -> { CustomReaction.count }, -1 do
              delete organization_custom_reaction_path(@organization.slug, @custom_reaction.public_id)
            end

            assert_response :no_content
            assert_nil CustomReaction.find_by(id: @custom_reaction.id)
          end

          test "doesn't allow viewer to destroy custom reactions" do
            viewer = create(:organization_membership, :viewer, organization: @organization)
            sign_in viewer.user

            assert_no_difference -> { CustomReaction.count } do
              delete organization_custom_reaction_path(@organization.slug, @custom_reaction.public_id)
            end

            assert_response :forbidden
            assert CustomReaction.find_by(id: @custom_reaction.id)
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            delete organization_custom_reaction_path(@organization.slug, @custom_reaction.public_id)

            assert_response :forbidden
            assert CustomReaction.find_by(id: @custom_reaction.id)
          end

          test "return 401 for an unauthenticated user" do
            delete organization_custom_reaction_path(@organization.slug, @custom_reaction.public_id)

            assert_response :unauthorized
            assert CustomReaction.find_by(id: @custom_reaction.id)
          end
        end
      end
    end
  end
end
