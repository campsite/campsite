# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module CalDotCom
        class OrganizationsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
          end

          describe "#update" do
            test "updates the user's Cal.com organization" do
              org = create(:organization_membership, user: @user).organization

              sign_in @user
              put cal_dot_com_organization_path, params: { organization_id: org.public_id }

              assert_response :no_content
              assert_equal org, @user.reload.cal_dot_com_organization
            end

            test "returns not found if no organization membership" do
              sign_in @user
              put cal_dot_com_organization_path, params: { organization_id: create(:organization).public_id }

              assert_response :not_found
            end

            test "returns unauthorized if user is not signed in" do
              put cal_dot_com_organization_path, params: { organization_id: create(:organization).public_id }
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
