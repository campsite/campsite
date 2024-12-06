# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module CustomReactions
      class PacksControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
        end

        context "#index" do
          test "returns custom reactions packs for org admin" do
            S3_BUCKET.expects(:objects).with(anything).times(5)
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
              ])
            sign_in @user

            get organization_custom_reactions_packs_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 5, json_response.length
          end

          test "returns custom reactions packs for org member" do
            S3_BUCKET.expects(:objects).with(anything).times(5)
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
              ])

            sign_in create(:organization_membership, :member, organization: @organization).user

            get organization_custom_reactions_packs_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 5, json_response.length
          end

          test "query count" do
            S3_BUCKET.expects(:objects).with(anything).times(5)
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
              ])

            sign_in @user

            assert_query_count 3 do
              get organization_custom_reactions_packs_path(@organization.slug)
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            get organization_custom_reactions_packs_path(@organization.slug)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_custom_reactions_packs_path(@organization.slug)

            assert_response :unauthorized
          end
        end

        context "#create" do
          test "installs custom reactions pack for org admin" do
            S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/meows")
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
                stub(key: "custom-reactions-packs/raging-meow.gif"),
              ])

            assert @organization.admin?(@user)
            sign_in @user

            post organization_custom_reactions_packs_path(@organization.slug),
              params: { name: "meows" },
              as: :json

            assert_response :no_content
            assert_equal 2, @organization.custom_reactions.count
          end

          test "installs custom reactions pack for org member" do
            S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/meows")
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
                stub(key: "custom-reactions-packs/raging-meow.gif"),
              ])

            org_member = create(:organization_membership, :member, organization: @organization)
            sign_in org_member.user

            post organization_custom_reactions_packs_path(@organization.slug),
              params: { name: "meows" },
              as: :json

            assert_response :no_content
            assert_equal 2, @organization.custom_reactions.count
          end

          test "query count" do
            S3_BUCKET.expects(:objects).with(anything)
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
              ])

            sign_in @user

            assert_query_count 9 do
              post organization_custom_reactions_packs_path(@organization.slug),
                params: { name: "blobs" },
                as: :json
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            post organization_custom_reactions_packs_path(@organization.slug),
              params: { name: "blobs" },
              as: :json

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_custom_reactions_packs_path(@organization.slug),
              params: { name: "blobs" },
              as: :json

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          before do
            S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/meows")
              .returns([
                stub(key: "custom-reactions-packs/party-meow.png"),
                stub(key: "custom-reactions-packs/raging-meow.gif"),
              ])
            CustomReactionsPack.install!(name: "meows", organization: @organization, creator: @member)
          end

          test "uninstalls custom reactions pack for org admin" do
            assert @organization.admin?(@user)
            sign_in @user

            delete organization_custom_reactions_pack_path(@organization.slug, "meows")
            assert_response :no_content
            assert_equal 0, @organization.custom_reactions.count
          end

          test "uninstalls custom reactions pack for org member" do
            org_member = create(:organization_membership, :member, organization: @organization)
            sign_in org_member.user

            delete organization_custom_reactions_pack_path(@organization.slug, "meows")

            assert_response :no_content
            assert_equal 0, @organization.custom_reactions.count
          end

          test "query count" do
            sign_in @user

            assert_query_count 8 do
              delete organization_custom_reactions_pack_path(@organization.slug, "meows")
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)

            delete organization_custom_reactions_pack_path(@organization.slug, "meows")

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_custom_reactions_pack_path(@organization.slug, "meows")

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
