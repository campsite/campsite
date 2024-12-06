# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class IntegrationDmsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @dm = create(:message_thread, :app_dm)
          @member = @dm.organization_memberships.first
          @oauth_app = @dm.oauth_applications.first
          @organization = @member.organization
        end

        context "#show" do
          test "returns a DM by oauth application id" do
            sign_in @member.user

            assert_query_count 11 do
              get organization_integration_dm_path(@organization.slug, @oauth_app.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal @dm.public_id, json_response["dm"]["id"]
          end

          test "returns nil if no existing DM" do
            create(:message_thread, :group, organization_memberships: [@member], oauth_applications: [@oauth_app])

            sign_in @member.user
            get organization_dm_path(@organization.slug, @oauth_app.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response["dm"]
          end
        end
      end
    end
  end
end
