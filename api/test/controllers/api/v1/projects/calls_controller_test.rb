# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class CallsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
        end

        context "#index" do
          before do
            @private_project = create(:project, :private, organization: @organization)
            @private_project_membership = @private_project.project_memberships.create!(organization_membership: @member)
            @open_project = create(:project, organization: @organization)
            @private_project_call = create(:call, :completed, :recorded, project: @private_project)
            @open_project_call = create(:call, :completed, :recorded, project: @open_project)
            @non_project_call = create(:call, :completed, :recorded, peers: [create(:call_peer, organization_membership: @member)])
          end

          test "returns calls for open project" do
            sign_in @member.user

            get organization_project_calls_path(@organization.slug, @open_project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@open_project_call.public_id], json_response["data"].pluck("id")
          end

          test "returns calls for private project" do
            sign_in @member.user

            get organization_project_calls_path(@organization.slug, @private_project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@private_project_call.public_id], json_response["data"].pluck("id")
          end

          test "return 403 for a non-member private project" do
            @private_project_membership.destroy!

            sign_in create(:user)
            get organization_project_calls_path(@organization.slug, @private_project.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_calls_path(@organization.slug, @open_project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_calls_path(@organization.slug, @open_project.public_id)
            assert_response :unauthorized
          end

          test "query count" do
            create_list(:call, 3, :completed, :recorded, project: @private_project)

            sign_in @member.user
            assert_query_count 12 do
              get organization_project_calls_path(@organization.slug, @private_project.public_id)
            end

            assert_response :ok
          end

          test "search returns matches" do
            match_title = create(:call, :completed, :recorded, project: @open_project, title: "Needle in a haystack")
            match_summary = create(:call, :completed, :recorded, project: @open_project, summary: "This call has a needle in it")

            Call.reindex

            sign_in @member.user
            get organization_project_calls_path(@organization.slug, @open_project.public_id), params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 2, ids.length
            assert_includes ids, match_title.public_id
            assert_includes ids, match_summary.public_id
          end
        end
      end
    end
  end
end
