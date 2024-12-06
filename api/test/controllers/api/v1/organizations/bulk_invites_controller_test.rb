# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class BulkInvitesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization, :pro)
          @user = create(:organization_membership, organization: @organization).user
        end

        context "#create" do
          test "creates multiple org invitations for an admin" do
            sign_in @user

            assert_difference -> { OrganizationInvitation.count }, 2 do
              emails = "ron@example.com,hermoine@example.com"
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal "member", json_response[0]["role"]
              assert_equal "ron@example.com", json_response[0]["email"]
              assert_equal "member", json_response[1]["role"]
              assert_equal "hermoine@example.com", json_response[1]["email"]
            end
          end

          test "trims whitespace" do
            sign_in @user

            assert_difference -> { OrganizationInvitation.count }, 2 do
              emails = "        ron@example.com,      hermoine@example.com  "
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal 2, json_response.length
            end
          end

          test "supports newlines" do
            sign_in @user

            assert_difference -> { OrganizationInvitation.count }, 3 do
              emails = <<~EMAILS
                ron@example.com
                hermoine@example.com, foo@example.com
              EMAILS
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal 3, json_response.length
            end
          end

          test "creates multiple org inviations for a member" do
            membership = create(:organization_membership, :member, organization: @organization)
            sign_in membership.user

            assert_difference -> { OrganizationInvitation.count }, 2 do
              emails = "ron@example.com,hermoine@example.com"
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal "member", json_response[0]["role"]
              assert_equal "ron@example.com", json_response[0]["email"]
              assert_equal "member", json_response[1]["role"]
              assert_equal "hermoine@example.com", json_response[1]["email"]
            end
          end

          test "does not create an invitation for an existing email" do
            create(:organization_invitation, email: "ron@example.com", organization: @organization)
            sign_in @user

            assert_difference -> { OrganizationInvitation.count }, 1 do
              emails = "ron@example.com,hermoine@example.com"
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal 1, json_response.length
            end
          end

          test "422s for an invalid email address" do
            sign_in @user

            assert_no_difference -> { OrganizationInvitation.count } do
              emails = "ron@example"
              post organization_bulk_invites_path(@organization.slug),
                params: { comma_separated_emails: emails },
                as: :json

              assert_response :unprocessable_entity
              assert_equal "Email is invalid", json_response["message"]
            end
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            emails = "ron@example.com,hermoine@example.com"
            post organization_bulk_invites_path(@organization.slug),
              params: { comma_separated_emails: emails },
              as: :json
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            emails = "ron@example.com,hermoine@example.com"
            post organization_bulk_invites_path(@organization.slug),
              params: { comma_separated_emails: emails },
              as: :json
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
