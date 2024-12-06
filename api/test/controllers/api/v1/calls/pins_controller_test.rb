# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class PinsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership, :member)
          @org = @member.organization
          @project = create(:project, organization: @org)
          @call = create(:call, project: @project, project_permission: :view)
        end

        context "#create" do
          test "creates a pin for a call" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_call_pin_path(@org.slug, @call.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @call.public_id, json_response["pin"]["call"]["id"]
            assert_nil json_response["pin"]["note"]
            assert_equal @member, ProjectPin.last.pinner
          end

          test "returns 404 for unknown call" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_call_pin_path(@org.slug, "abcdefg")
            end

            assert_response :not_found
          end

          test "returns 403 when pinning to a private project without membership" do
            @project.update(private: true)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_call_pin_path(@org.slug, @call.public_id)
            end

            assert_response :forbidden
          end

          test "creates a pin for a call in a private project" do
            @project.update(private: true)
            create(:project_membership, organization_membership: @member, project: @project)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_call_pin_path(@org.slug, @call.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @call.public_id, json_response["pin"]["call"]["id"]
            assert_nil json_response["pin"]["note"]
            assert_equal @member, ProjectPin.last.pinner
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_call_pin_path(@org.slug, @call.public_id)
            assert_response :forbidden
          end

          test "returns 401 for unauthorized user" do
            post organization_call_pin_path(@org.slug, @call.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
