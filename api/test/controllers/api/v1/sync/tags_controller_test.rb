# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Sync
      class TagsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        context "#index" do
          test "returns tags the viewer has access to" do
            tags = create_list(:tag, 3, organization: @organization)
            create_list(:tag, 3)

            sign_in @member.user
            get organization_sync_tags_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response.count
            assert_includes json_response.pluck("id"), tags[0].public_id
            assert_includes json_response.pluck("id"), tags[1].public_id
            assert_includes json_response.pluck("id"), tags[2].public_id
          end

          test "query count" do
            create_list(:tag, 3, organization: @organization)

            sign_in @member.user

            assert_query_count 3 do
              get organization_sync_tags_path(@organization.slug)
            end
          end
        end
      end
    end
  end
end
