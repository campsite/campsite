# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Sync
      class MembersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        context "#index" do
          test "returns members the viewer has access to" do
            members = create_list(:organization_membership, 3, organization: @organization)
            members[1].discard!

            create_list(:organization_membership, 3)

            sign_in @member.user
            get organization_sync_members_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response.pluck("id"), members[0].public_id
            assert_includes json_response.pluck("id"), members[1].public_id
            assert json_response.select { |m| m["id"] == members[1].public_id }.first["deactivated"]
            assert_includes json_response.pluck("id"), members[2].public_id
          end

          test "for a guest, only returns guests who share a project" do
            project = create(:project, organization: @organization)
            guest_in_project = create(:organization_membership, :guest, organization: @organization)
            project.add_member!(guest_in_project)
            other_guest_in_project = create(:organization_membership, :guest, organization: @organization)
            project.add_member!(other_guest_in_project)
            other_guest_not_in_project = create(:organization_membership, :guest, organization: @organization)

            sign_in guest_in_project.user
            get organization_sync_members_path(@organization.slug)

            assert_response :ok
            assert_includes json_response.pluck("id"), guest_in_project.public_id
            assert_includes json_response.pluck("id"), other_guest_in_project.public_id
            assert_includes json_response.pluck("id"), @member.public_id
            assert_not_includes json_response.pluck("id"), other_guest_not_in_project.public_id
          end

          test "query count" do
            members = create_list(:organization_membership, 3, organization: @organization)
            members[1].discard!

            sign_in @member.user

            assert_query_count 3 do
              get organization_sync_members_path(@organization.slug)
            end
          end
        end
      end
    end
  end
end
