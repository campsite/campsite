# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OauthApplications
      class PresignedFieldsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @oauth_application = create(:oauth_application, owner: @organization)
        end

        context "#show" do
          test "returns presigned fields" do
            sign_in @member.user
            get organization_oauth_application_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_oauth_application_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_oauth_application_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
