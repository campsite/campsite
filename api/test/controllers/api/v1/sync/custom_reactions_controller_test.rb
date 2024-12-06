# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Sync
      class CustomReactionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        context "#index" do
          test "returns custom reactions the viewer has access to" do
            custom_reactions = create_list(:custom_reaction, 3, organization: @organization)
            create_list(:custom_reaction, 3)

            sign_in @member.user
            get organization_sync_custom_reactions_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response.count
            assert_includes json_response.pluck("id"), custom_reactions[0].public_id
            assert_includes json_response.pluck("id"), custom_reactions[1].public_id
            assert_includes json_response.pluck("id"), custom_reactions[2].public_id
          end

          test "query count" do
            create_list(:custom_reaction, 3, organization: @organization)

            sign_in @member.user

            assert_query_count 3 do
              get organization_sync_custom_reactions_path(@organization.slug)
            end
          end
        end
      end
    end
  end
end
