# frozen_string_literal: true

require "test_helper"

module Users
  class ConfirmationsControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
      host! "auth.campsite.com"
    end

    context "show" do
      test "confirms user email and redirects to app" do
        user = create(:user, :unconfirmed)
        assert_not_predicate user, :confirmed?

        get user_confirmation_path(confirmation_token: user.confirmation_token)

        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
        assert_predicate user.reload, :confirmed?
      end

      test "redirects an already confirmed user email to the app" do
        user = create(:user, :unconfirmed)
        assert_not_predicate user, :confirmed?

        # first attempt confirms
        get user_confirmation_path(confirmation_token: user.confirmation_token)
        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
        assert_predicate user.reload, :confirmed?

        # second attemt for already confirmed email
        get user_confirmation_path(confirmation_token: user.confirmation_token)
        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
      end

      test "does not confirm user email and redirects to app" do
        user = create(:user, :unconfirmed)
        assert_not_predicate user, :confirmed?

        get user_confirmation_path(confirmation_token: "invalid-token")

        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
        assert_not_predicate user.reload, :confirmed?
      end

      test "adds user to verified domain organization" do
        org = create(:organization, name: "harry", email_domain: "campsite.com")
        user = create(:user, :unconfirmed, email: "#{Faker::Internet.username}@campsite.com")

        get user_confirmation_path(confirmation_token: user.confirmation_token)
        assert_response :redirect
        assert_predicate user.reload, :confirmed?
        assert_includes user.organizations, org
        org_membership = user.organization_memberships.find_by(organization: org)
        assert_equal Role::MEMBER_NAME, org_membership.role.name
      end

      test "adds user to verified domain organization with correct role if an invitation exists" do
        org = create(:organization, name: "harry", email_domain: "campsite.com")
        user = create(:user, :unconfirmed, email: "#{Faker::Internet.username}@campsite.com")
        create(:organization_invitation, organization: org, email: user.email, role: Role::MEMBER_NAME)

        get user_confirmation_path(confirmation_token: user.confirmation_token)
        assert_response :redirect

        org_membership = user.organization_memberships.find_by(organization: org)
        assert_equal Role::MEMBER_NAME, org_membership.role.name
      end
    end
  end
end
