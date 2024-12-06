# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class TagsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:organization_membership).user
        @organization = @user.organizations.first
      end

      context "#index" do
        before do
          @bug_tag = create(:tag, name: "bug", organization: @organization)
          @enhancement_tag = create(:tag, name: "enhancement", organization: @organization)
        end

        test "returns paginated tags" do
          sign_in @user
          get organization_tags_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [@enhancement_tag.public_id, @bug_tag.public_id], json_response["data"].pluck("id")
          assert_equal [0, 0], json_response["data"].pluck("posts_count")
        end

        test "returns tags that match the query string" do
          sign_in @user
          get organization_tags_path(@organization.slug), params: { q: "bu" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal [@bug_tag.public_id], json_response["data"].pluck("id")
          assert_equal [0], json_response["data"].pluck("posts_count")
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_tags_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_tags_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#posts" do
        setup do
          @tag = create(:tag, organization: @organization)
          create(:post_tagging, tag: @tag, post: create(:post, organization: @organization))
          parent_tag = create(:post_tagging, tag: @tag, post: create(:post, organization: @organization))
          create(:post_tagging, tag: @tag, post: create(:post, organization: @organization, parent: parent_tag.post))
        end

        test "returns paginated tag posts for an org admin" do
          sign_in @user
          get organization_tag_posts_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
        end

        test "returns paginated feed for a member" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_tag_posts_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
        end

        test "doesn't return drafts" do
          member = create(:organization_membership, :member, organization: @organization)
          draft_post = create(:post, :draft, organization: @organization, member: member)
          create(:post_tagging, tag: @tag, post: draft_post)

          sign_in member.user
          get organization_tag_posts_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_not_includes json_response["data"].pluck("id"), draft_post.public_id
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_tag_posts_path(@organization.slug, @tag.name)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_tag_posts_path(@organization.slug, @tag.name)
          assert_response :unauthorized
        end
      end

      context "#create" do
        test "creates an organization tag for an admin" do
          assert @organization.admin?(@user)

          sign_in @user

          assert_difference -> { Tag.count } do
            post organization_tags_path(@organization.slug), params: { name: "enhancement" }

            assert_response :created
            assert_response_gen_schema
            assert_equal "enhancement", json_response["name"]
          end
        end

        test "creates an organization tag for a org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member

          assert_difference -> { Tag.count } do
            post organization_tags_path(@organization.slug), params: { name: "hip-project" }

            assert_response :created
            assert_response_gen_schema
            assert_equal "hip-project", json_response["name"]
          end
        end

        test "doesn't allow viewer to create a tag" do
          viewer = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer.user

          assert_no_difference -> { Tag.count } do
            post organization_tags_path(@organization.slug), params: { name: "hip-project" }

            assert_response :forbidden
          end
        end

        test "returns an error for a tag with an existing name" do
          create(:tag, name: "hip-project", organization: @organization)

          sign_in @user

          assert_no_difference -> { Tag.count } do
            post organization_tags_path(@organization.slug), params: { name: "hip-project" }

            assert_response :unprocessable_entity
            assert_equal "Name has already been taken", json_response["message"]
          end
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          post organization_tags_path(@organization.slug), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_tags_path(@organization.slug), params: { name: "new-name" }
          assert_response :unauthorized
        end
      end

      context "#show" do
        before do
          @tag = create(:tag, organization: @organization)
        end

        test "returns the tag for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          get organization_tag_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns the tag for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          get organization_tag_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_destroy"]
        end

        test "returns the tag for a viewer" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          get organization_tag_path(@organization.slug, @tag.name)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_can_destroy"]
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_tag_path(@organization.slug, @tag.name)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_tag_path(@organization.slug, @tag.name)
          assert_response :unauthorized
        end
      end

      context "#update" do
        before do
          @tag = create(:tag, organization: @organization)
        end

        test "updates the project for an org admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_tag_path(@organization.slug, @tag.name), params: { name: "big-project" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "big-project", json_response["name"]
        end

        test "updates the project for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          put organization_tag_path(@organization.slug, @tag.name), params: { name: "big-project" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal "big-project", json_response["name"]
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_tag_path(@organization.slug, @tag.name), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_tag_path(@organization.slug, @tag.name), params: { name: "new-name" }
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        before do
          @tag = create(:tag, organization: @organization)
        end

        test "destroys the tag for an org admin" do
          assert @organization.admin?(@user)

          sign_in @user
          delete organization_tag_path(@organization.slug, @tag.name)

          assert_response :no_content
          assert_nil Tag.find_by(id: @tag.id)
        end

        test "destroys the tag for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          delete organization_tag_path(@organization.slug, @tag.name)

          assert_response :no_content
          assert_nil Tag.find_by(id: @tag.id)
        end

        test "prevents viewer from destroying a tag" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          delete organization_tag_path(@organization.slug, @tag.name)

          assert_response :forbidden
          assert Tag.find_by(id: @tag.id)
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          delete organization_tag_path(@organization.slug, @tag.name)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_tag_path(@organization.slug, @tag.name)
          assert_response :unauthorized
        end
      end
    end
  end
end
