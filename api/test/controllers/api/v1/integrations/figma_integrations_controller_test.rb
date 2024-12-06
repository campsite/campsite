# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      class FigmaIntegrationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
          @integration = create(:integration, provider: :figma, owner: @user)
        end

        describe "#show" do
          test "returns true when an integration exists" do
            sign_in @user
            get figma_integration_path

            assert_response :ok
            assert_response_gen_schema

            assert_equal true, json_response["has_figma_integration"]
          end

          test "returns false when an integration doesn't exist" do
            @integration.destroy
            sign_in @user
            get figma_integration_path

            assert_response :ok
            assert_response_gen_schema

            assert_equal false, json_response["has_figma_integration"]
          end

          test "return 401 for an unauthenticated user" do
            get figma_integration_path
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
