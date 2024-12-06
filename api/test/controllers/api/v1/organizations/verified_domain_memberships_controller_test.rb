# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class VerifiedDomainMembershipsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#create" do
          test "lets user join organization when email domain matches" do
            user = create(:user, email: "foo@example.com")
            organization = create(:organization, :pro, email_domain: "example.com")

            sign_in user

            assert_difference -> { organization.members.count }, 1 do
              post organization_verified_domain_memberships_path(organization.slug)
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal user.public_id, json_response["user"]["id"]
          end

          test "noops if user is already a member" do
            user = create(:user, email: "foo@example.com")
            organization = create(:organization, :pro, email_domain: "example.com")
            create(:organization_membership, organization: organization, user: user)

            sign_in user

            assert_difference -> { organization.members.count }, 0 do
              post organization_verified_domain_memberships_path(organization.slug)
            end

            assert_response :unprocessable_entity
          end

          test "403s when emails do not match" do
            user = create(:user, email: "foo@bar.com")
            organization = create(:organization, :pro, email_domain: "example.com")

            sign_in user

            assert_difference -> { organization.members.count }, 0 do
              post organization_verified_domain_memberships_path(organization.slug)
            end

            assert_response :forbidden
          end

          test "403s when org does not use verified domain" do
            user = create(:user, email: "foo@bar.com")
            organization = create(:organization, :pro)

            sign_in user

            assert_difference -> { organization.members.count }, 0 do
              post organization_verified_domain_memberships_path(organization.slug)
            end

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            organization = create(:organization, :pro, email_domain: "example.com")
            assert_difference -> { organization.members.count }, 0 do
              post organization_verified_domain_memberships_path(organization.slug)
            end
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
