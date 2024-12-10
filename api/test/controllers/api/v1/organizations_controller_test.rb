# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OrganizationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:organization_membership).user
        @organization = @user.organizations.first
      end

      context "#create" do
        test "creates the organization for a confirmed user" do
          assert_predicate @user, :confirmed?

          sign_in @user

          assert_query_count 54 do
            post organizations_path, params: { name: "Campsite Design", slug: "campsite-design" }
          end

          assert_response :created
          assert_response_gen_schema
          assert_equal "Campsite Design", json_response["name"]
          assert_equal "campsite-design", json_response["slug"]
          org = Organization.find_by(slug: "campsite-design")
          member = org.memberships.find_by!(user_id: @user.id)
          assert_equal "admin", member.role_name
        end

        test "creates the organization with role and org size" do
          sign_in @user

          post organizations_path, params: { name: "Campsite Design", slug: "campsite-design", role: "founder", org_size: "10-25" }

          assert_response :created
          assert_response_gen_schema

          org = Organization.find_by(slug: "campsite-design")
          assert_equal "founder", org.creator_role
          assert_equal "10-25", org.creator_org_size
        end

        test "returns an error for an invalid param" do
          assert_predicate @user, :confirmed?

          sign_in @user
          post organizations_path, params: { name: "Campsite Design", slug: "**campsite-design" }

          assert_response :unprocessable_entity
          assert_match(/Organization URL can only contain lowercase alphanumeric/, json_response["message"])
        end

        test "return 403 for an unconfirmed user" do
          @user.update!(confirmed_at: nil)
          assert_not_predicate @user, :confirmed?

          sign_in @user
          post organizations_path, params: { name: "Campsite Design", slug: "campsite-design" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organizations_path, params: { name: "Campsite Design", slug: "campsite-design" }
          assert_response :unauthorized
        end
      end

      context "#show" do
        test "returns the organization for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          get organization_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal true, json_response["viewer_is_admin"]
        end

        test "returns the org for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          get organization_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal false, json_response["viewer_is_admin"]
        end

        test "includes viewer abilities for admin" do
          sign_in @user
          get organization_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert json_response["viewer_can_post"]
          assert json_response["viewer_can_create_digest"]
          assert json_response["viewer_can_create_project"]
          assert json_response["viewer_can_see_new_project_button"]
          assert json_response["viewer_can_see_projects_index"]
          assert json_response["viewer_can_see_people_index"]
          assert json_response["viewer_can_create_tag"]
          assert json_response["viewer_can_create_note"]
        end

        test "includes viewer abilities for viewer" do
          viewer = create(:organization_membership, :viewer, organization: @organization).user

          sign_in viewer
          get organization_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_not json_response["viewer_can_post"]
          assert_not json_response["viewer_can_create_digest"]
          assert_not json_response["viewer_can_create_project"]
          assert json_response["viewer_can_see_new_project_button"]
          assert json_response["viewer_can_see_projects_index"]
          assert json_response["viewer_can_see_people_index"]
          assert_not json_response["viewer_can_create_tag"]
          assert_not json_response["viewer_can_create_note"]
        end

        test "includes viewer abilities for guest" do
          viewer = create(:organization_membership, :guest, organization: @organization).user

          sign_in viewer
          get organization_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert json_response["viewer_can_post"]
          assert_not json_response["viewer_can_create_digest"]
          assert_not json_response["viewer_can_create_project"]
          assert_not json_response["viewer_can_see_new_project_button"]
          assert_not json_response["viewer_can_see_projects_index"]
          assert_not json_response["viewer_can_see_people_index"]
          assert_not json_response["viewer_can_create_tag"]
          assert_not json_response["viewer_can_create_note"]
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_path(@organization.slug)
          assert_response :unauthorized
        end

        context "with 2fa enforced" do
          setup do
            @organization.update_setting(:enforce_two_factor_authentication, true)
          end

          test "works for a user with 2fa enabled" do
            @user.update!(otp_enabled: true)

            sign_in @user
            get organization_path(@organization.slug)
            assert_response :ok
          end

          test "returns 403 for a user with 2fa disabled" do
            @user.update!(otp_enabled: false)

            sign_in @user
            get organization_path(@organization.slug)
            assert_response :forbidden
            assert_match(/Your organization has enforced two-factor authentication/, json_response["message"])
          end
        end

        context "with sso required" do
          setup do
            @organization.update!(workos_organization_id: "work-os-org-id")
            @organization.update_setting(:enforce_sso_authentication, true)
          end

          test "works for a sso authenticated user" do
            sso_sign_in(user: @user, organization: @organization)
            get organization_path(@organization.slug)
            assert_response :ok
          end

          test "works for a guest in an SSO organization" do
            guest_member = create(:organization_membership, :guest, organization: @organization)

            sign_in guest_member.user
            get organization_path(@organization.slug)

            assert_response :ok
          end

          test "returns 403 for a user without sso authentication" do
            sign_in @user
            get organization_path(@organization.slug)

            assert_response :forbidden
            assert_match(/Your organization requires SSO authentication/, json_response["message"])
            assert_match(/sso_required/, json_response["code"])
          end
        end

        test("query count") do
          sign_in @user

          assert_query_count 6 do
            get organization_path(@organization.slug)
          end
        end
      end

      context "#update" do
        test "updates the organization for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_path(@organization.slug),
            params: { name: "new name", slug: "new-slug", billing_email: "billing@example.com" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "new-slug", json_response["slug"]
          assert_equal "new name", json_response["name"]
          assert_equal "billing@example.com", json_response["billing_email"]
        end

        test "updates the organization email domain for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_path(@organization.slug), params: { email_domain: "example.com" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "example.com", json_response["email_domain"]
        end

        test "updates the organization avatar_path for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_path(@organization.slug), params: { avatar_path: "path/to/image.png" }

          assert_response :ok
          assert_response_gen_schema
          assert_includes json_response["avatar_url"], "http://campsite-test.imgix.net/path/to/image.png"
        end

        test "does not update the organization email domain if domains dont match" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_path(@organization.slug), params: { email_domain: "campsite.com" }

          assert_response :unprocessable_entity
          assert_match(/The domain provided does not match your email address domain/, json_response["message"])
        end

        test "updating an organization's name doesn't override the email domain" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_path(@organization.slug), params: { email_domain: "campsite.com" }
          put organization_path(@organization.slug), params: { name: "Test name" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "campsite.com", json_response["email_domain"]
        end

        test "return 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          put organization_path(@organization.slug), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_path(@organization.slug), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_path(@organization.slug), params: { name: "new-name" }
          assert_response :unauthorized
        end

        context "with 2fa enforced" do
          setup do
            @organization.update_setting(:enforce_two_factor_authentication, true)
          end

          test "works for a user with 2fa enabled" do
            @user.update!(otp_enabled: true)

            sign_in @user
            put organization_path(@organization.slug), params: { name: "new-name" }
            assert_response :ok
          end

          test "returns 403 for a user with 2fa disabled" do
            @user.update!(otp_enabled: false)

            sign_in @user
            put organization_path(@organization.slug), params: { name: "new-name" }
            assert_response :forbidden
            assert_match(/Your organization has enforced two-factor authentication/, json_response["message"])
          end
        end

        context "with sso required" do
          setup do
            @organization.update!(workos_organization_id: "work-os-org-id")
            @organization.update_setting(:enforce_sso_authentication, true)
          end

          test "works for a sso authenticated user" do
            sso_sign_in(user: @user, organization: @organization)
            put organization_path(@organization.slug), params: { name: "new-name" }
            assert_response :ok
          end

          test "returns 403 for a user without sso authentication" do
            sign_in @user
            put organization_path(@organization.slug), params: { name: "new-name" }

            assert_response :forbidden
            assert_match(/Your organization requires SSO authentication/, json_response["message"])
            assert_match(/sso_required/, json_response["code"])
          end
        end
      end

      context "#reset_invite_token" do
        test "admin can reset the org invite token" do
          assert @organization.admin?(@user)
          old_url = @organization.invitation_url

          sign_in @user
          put organization_reset_invite_token_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_not_equal old_url, json_response["invitation_url"]
        end

        test "member can reset the org invite token" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          put organization_reset_invite_token_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
        end

        test "guest cannot reset the org invite token" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          put organization_reset_invite_token_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_reset_invite_token_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_reset_invite_token_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        test "destroys the org for an admin" do
          sign_in @user
          delete organization_path(@organization.slug)

          assert_response :no_content
          assert_nil Organization.find_by(id: @organization.id)
        end

        test "return 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          delete organization_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          delete organization_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_path(@organization.slug)
          assert_response :unauthorized
        end

        context "with 2fa enforced" do
          setup do
            @organization.update_setting(:enforce_two_factor_authentication, true)
          end

          test "works for a user with 2fa enabled" do
            @user.update!(otp_enabled: true)

            sign_in @user
            delete organization_path(@organization.slug)
            assert_response :no_content
          end

          test "returns 403 for a user with 2fa disabled" do
            @user.update!(otp_enabled: false)

            sign_in @user
            delete organization_path(@organization.slug)
            assert_response :forbidden
            assert_match(/Your organization has enforced two-factor authentication/, json_response["message"])
          end
        end

        context "with sso required" do
          setup do
            @organization.update!(workos_organization_id: "work-os-org-id")
            @organization.update_setting(:enforce_sso_authentication, true)
          end

          test "works for a sso authenticated user" do
            sso_sign_in(user: @user, organization: @organization)
            delete organization_path(@organization.slug)
            assert_response :no_content
          end

          test "returns 403 for a user without sso authentication" do
            sign_in @user
            delete organization_path(@organization.slug)

            assert_response :forbidden
            assert_match(/Your organization requires SSO authentication/, json_response["message"])
            assert_match(/sso_required/, json_response["code"])
          end
        end
      end

      context "#join" do
        setup do
          @potential_member = create(:user)
        end

        test "adds the user to the org as a member if the user's email domain matches the org email domain" do
          @organization.update!(email_domain: "example.com")

          sign_in @potential_member
          post organization_join_path(@organization.slug, @organization.invite_token)

          assert_response :ok
          assert_equal false, json_response["requested"]
          assert_equal true, json_response["joined"]
          member = @organization.memberships.find_by(user_id: @potential_member.id)
          assert_equal Role::MEMBER_NAME, member.role_name
        end

        test "requests memberships to the org if the org email domain is blank" do
          sign_in @potential_member
          post organization_join_path(@organization.slug, @organization.invite_token)

          assert_response :ok
          assert_equal false, json_response["requested"]
          assert_equal true, json_response["joined"]
        end

        test "does not re-add an existing org member" do
          create(:organization_membership, user: @potential_member, organization: @organization)
          assert @organization.member?(@potential_member)

          sign_in @potential_member
          post organization_join_path(@organization.slug, @organization.invite_token)

          assert_response :ok
          assert_equal true, json_response["joined"]
        end

        test "return 401 for an unauthenticated user" do
          post organization_join_path(@organization.slug, @organization.invite_token)
          assert_response :unauthorized
        end
      end

      context "#avatar_presigned_fields" do
        setup do
          @member = create(:organization_membership, :member, organization: @organization).user
        end

        test "returns presigned fieldss for an admin" do
          sign_in @user
          get organization_avatar_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns presigned fields for a member" do
          sign_in @member
          get organization_avatar_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_avatar_presigned_fields_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_avatar_presigned_fields_path(@organization.slug)
          assert_response :unauthorized
        end
      end
    end
  end
end
