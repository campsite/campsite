# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OrganizationMembersControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user_member = create(:organization_membership)
        @user = @user_member.user
        @organization = @user.organizations.first
      end

      context "#index" do
        setup do
          @member = create(:organization_membership, :member, organization: @organization)
          @other_member = create(:organization_membership, :member, organization: @organization)
        end

        test "returns paginated org admins for an admin" do
          @other_member.update!(last_seen_at: 1.minute.ago)
          @user_member.update!(last_seen_at: 1.day.ago)
          @member.update!(last_seen_at: 1.month.ago)

          sign_in @user
          get organization_members_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 3, json_response["data"].length
          assert_equal [@other_member.public_id, @user_member.public_id, @member.public_id], json_response["data"].pluck("id")
        end

        test "returns paginated org members for a member" do
          # create posts in different orgs for the member
          create(:post, member: @member, organization: @organization)
          create(:post, member: @member)

          sign_in @member.user
          get organization_members_path(@organization.slug)

          assert_response :ok
          assert_equal 3, json_response["data"].length
          expected_ids = @organization.memberships.pluck(:public_id).sort
          assert_equal expected_ids, json_response["data"].pluck("id").sort
        end

        test "returns members when searching with an email address" do
          sign_in @user
          get organization_members_path(@organization.slug), params: { q: @user.email }

          assert_response :ok
          assert_response_gen_schema
          assert_equal [@user_member.public_id], json_response["data"].pluck("id")
        end

        test "returns deactivated users with query param status=deactivated" do
          @member.discard!

          sign_in @user
          get organization_members_path(@organization.slug), params: { status: "deactivated" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal [@member.public_id], json_response["data"].pluck("id")
        end

        test "returns viewer members with query param roles[]=viewer" do
          @member.update!(role_name: "viewer")

          sign_in @user
          get organization_members_path(@organization.slug), params: { roles: ["viewer"] }

          assert_response :ok
          assert_response_gen_schema
          assert_equal [@member.public_id], json_response["data"].pluck("id")
        end

        test "for a guest, only returns guests who share a project" do
          project = create(:project, organization: @organization)
          guest_in_project = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(guest_in_project)
          other_guest_in_project = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(other_guest_in_project)
          other_guest_not_in_project = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_in_project.user
          get organization_members_path(@organization.slug)

          assert_response :ok
          assert_includes json_response["data"].pluck("id"), guest_in_project.public_id
          assert_includes json_response["data"].pluck("id"), other_guest_in_project.public_id
          assert_includes json_response["data"].pluck("id"), @user_member.public_id
          assert_not_includes json_response["data"].pluck("id"), other_guest_not_in_project.public_id
        end

        test "guest in no projects can see self" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_members_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_includes json_response["data"].pluck("id"), guest_member.public_id
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_members_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_members_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#show" do
        setup do
          @membership = create(:organization_membership, :member, organization: @organization)
        end

        test "works for an admin" do
          sign_in @user
          get organization_member_path(@organization.slug, @membership.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "works for a member" do
          sign_in @membership.user
          get organization_member_path(@organization.slug, @membership.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns info about a discarded member" do
          @membership.discard!

          sign_in @user
          get organization_member_path(@organization.slug, @membership.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "guest can see member" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_member_path(@organization.slug, @membership.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "guest can see guest in shared project" do
          project = create(:project, organization: @organization)
          guest_member = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(guest_member)
          other_guest_member = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(other_guest_member)

          sign_in guest_member.user
          get organization_member_path(@organization.slug, other_guest_member.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "guest can't see guest without shared project" do
          project = create(:project, organization: @organization)
          guest_member = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(guest_member)
          other_guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_member_path(@organization.slug, other_guest_member.user.username)

          assert_response :forbidden
        end

        test "guest in no projects can see self" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_member_path(@organization.slug, guest_member.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "member can see guest without a shared project" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in @user
          get organization_member_path(@organization.slug, guest_member.user.username)

          assert_response :ok
          assert_response_gen_schema
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }
          assert_response :unauthorized
        end
      end

      context "#posts" do
        before do
          @membership = create(:organization_membership, :member, organization: @organization)
          @post_a = create(:post, :with_links, :with_attachments, :with_reactions, :with_tags, :with_viewers, organization: @organization, member: @membership)
          @post_b = create(:post, organization: @organization, member: @membership)
          # not associated to the current org
          create(:post, :with_links, :with_attachments, :with_reactions, member: @membership)
        end

        test "returns paginated posts for an admin" do
          sign_in @user
          get organization_member_posts_path(@organization.slug, @membership.username)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_equal [@post_b.public_id, @post_a.public_id], json_response["data"].pluck("id")
        end

        test "sorts by last_activity_at when specified" do
          @post_a.update!(last_activity_at: 1.hour.ago)
          @post_b.update!(last_activity_at: 1.day.ago)

          sign_in @user
          get organization_member_posts_path(@organization.slug, @membership.username),
            params: { order: { by: "last_activity_at", direction: "desc" } }

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_equal [@post_a.public_id, @post_b.public_id], json_response["data"].pluck("id")
        end

        test "returns paginated posts for a member" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_member_posts_path(@organization.slug, @membership.username)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_equal [@post_b.public_id, @post_a.public_id], json_response["data"].pluck("id")
        end

        test "it includes grouped_reactions" do
          member = create(:organization_membership, user: create(:user, name: "Harry Potter"), organization: @organization)
          other_member = create(:organization_membership, user: create(:user, name: "Hermione"), organization: @organization)
          create(:reaction, subject: @post_a, member: member, content: "️👍")
          create(:reaction, subject: @post_a, member: other_member, content: "️👍")

          sign_in member.user
          get organization_member_posts_path(@organization.slug, @membership.username)

          assert_response :ok
          assert_response_gen_schema
          post_response = json_response["data"].find { |post| post["id"] == @post_a.public_id }

          reaction = post_response["grouped_reactions"].find { |reaction| reaction["emoji"] == "️👍" }
          assert_equal "Harry Potter, Hermione", reaction["tooltip"]
        end

        test("it includes preview_commenters") do
          other_member = create(:organization_membership, organization: @organization)
          create(:comment, subject: @post_a, member: other_member)

          sign_in @user
          get organization_member_posts_path(@organization.slug, @membership.username)

          assert_response :ok
          assert_response_gen_schema
          post_response = json_response["data"].find { |post| post["id"] == @post_a.public_id }
          assert_equal 1, post_response["preview_commenters"]["latest_commenters"].length
          assert_equal [other_member.public_id], post_response["preview_commenters"]["latest_commenters"].pluck("id")
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_member_posts_path(@organization.slug, @membership.username)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_member_posts_path(@organization.slug, @membership.username)
          assert_response :unauthorized
        end

        test "doesn't use excessive number of queries" do
          sign_in @user

          assert_query_count 15 do
            get organization_member_posts_path(@organization.slug, @membership.username)
          end

          assert_response :ok
        end

        test "doesn't return drafts" do
          draft_post = create(:post, :draft, organization: @organization, member: @membership)

          sign_in @membership.user
          get organization_member_posts_path(@organization.slug, @membership.username)

          assert_response :ok
          assert_equal 2, json_response["data"].length
          assert_not_includes json_response["data"].pluck("id"), draft_post.public_id
        end
      end

      context "#update" do
        setup do
          @membership = create(:organization_membership, :member, organization: @organization)
        end

        test "updates a member role" do
          assert_predicate @membership, :member?

          sign_in @user
          put organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }

          assert_response :ok
          assert_response_gen_schema
          assert_predicate @membership.reload, :admin?
          assert_equal "admin", @membership.reload.role_name
          assert_equal "admin", json_response["role"]
        end

        test "does not update a role for the only admin on an organization" do
          assert_equal 1, @organization.admins.size

          sign_in @user
          put organization_member_path(@organization.slug, @organization.admin_memberships.first.public_id), params: { role: :member }
          assert_response :unprocessable_entity
          assert_equal "Role cannot be updated to a member.", json_response["message"]
        end

        test "returns 404 for a discarded member" do
          @membership.discard!

          sign_in @user
          put organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }

          assert_response :not_found
        end

        test "returns 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          put organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }
          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_member_path(@organization.slug, @membership.public_id), params: { role: :admin }
          assert_response :unauthorized
        end
      end

      context "#reactivate" do
        setup do
          @membership = create(:organization_membership, :member, organization: @organization)
        end

        test "reactivates for a discarded member" do
          create(:project, :default, organization: @organization)
          create(:project, :general, organization: @organization)
          @membership.discard!

          sign_in @user
          put organization_member_reactivate_path(@organization.slug, @membership.public_id)

          assert_response :no_content
          assert_includes @organization.memberships, @membership
          assert_equal 2, @membership.project_memberships.count
        end

        test "returns 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          put organization_member_reactivate_path(@organization.slug, @membership.public_id)
          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_member_reactivate_path(@organization.slug, @membership.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_member_reactivate_path(@organization.slug, @membership.public_id)
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        setup do
          @membership = create(:organization_membership, :member, organization: @organization)
        end

        test "works for an admin" do
          sign_in @user
          delete organization_member_path(@organization.slug, @membership.public_id)

          assert_response :no_content
          assert_predicate @membership.reload, :discarded?
        end

        test "returns an error for a discarded member" do
          @membership.discard!

          sign_in @user
          delete organization_member_path(@organization.slug, @membership.public_id)

          assert_response :not_found
        end

        test "returns an error if the last admin tries to remove their membership" do
          sign_in @user
          delete organization_member_path(@organization.slug, @organization.memberships.first.public_id)

          assert_response :unprocessable_entity
          assert_match(/Please transfer ownership/, json_response["message"])
        end

        test "returns 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          delete organization_member_path(@organization.slug, @membership.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_member_path(@organization.slug, @membership.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
