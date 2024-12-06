# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Figma
      class FilesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        include RackAttackHelper

        setup do
          @organization = create(:organization)
          @org_member = create(:organization_membership, organization: @organization)
          @user = @org_member.user
        end

        context "#create" do
          test "works for an org user" do
            sign_in @user
            post organization_figma_files_path(@organization.slug),
              params: {
                remote_file_key: "abc123",
                name: "My File",
              }
            assert_response :created
            assert_response_gen_schema
          end

          test "updates the original on duplicate request" do
            sign_in @user
            post organization_figma_files_path(@organization.slug),
              params: {
                remote_file_key: "abc123",
                name: "My File",
              }
            assert_response :created
            assert_response_gen_schema

            post organization_figma_files_path(@organization.slug),
              params: {
                remote_file_key: "abc123",
                name: "My File (Edited)",
              }
            assert_response :created
            assert_response_gen_schema

            assert_equal 1, FigmaFile.count
            assert_equal "My File (Edited)", FigmaFile.first.name
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_figma_files_path(@organization.slug),
              params: {
                remote_file_key: "abc123",
                name: "My File",
              }
            assert_response :forbidden
          end
        end
      end
    end
  end
end
