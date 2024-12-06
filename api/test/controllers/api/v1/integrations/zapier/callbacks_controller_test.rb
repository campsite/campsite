# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class CallbacksControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper

          test "returns the organization name" do
            integration = create(:integration, :zapier)
            get zapier_integration_callback_path, headers: zapier_app_request_headers(integration.token)

            assert_response :ok
            assert_equal integration.owner.name, json_response["organization_name"]
          end

          test "returns an error if the integration token is invalid" do
            get zapier_integration_callback_path, headers: zapier_app_request_headers("invalid_token")

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
