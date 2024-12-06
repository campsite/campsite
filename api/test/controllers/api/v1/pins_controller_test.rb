# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PinsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @org = @member.organization
      end

      context "#destroy" do
        before do
          @project = create(:project, organization: @org)
          @pin = create(:project_pin, project: @project, pinner: @member)
        end

        test "removes a pin" do
          sign_in @member.user

          assert_difference -> { ProjectPin.count }, 0 do
            delete organization_pin_path(@org.slug, @pin.public_id)
          end

          assert_response :no_content

          assert_predicate @pin.reload, :discarded?
        end

        test "removes a pin in a private project with membership" do
          @project.update(private: true)
          create(:project_membership, organization_membership: @member, project: @project)

          sign_in @member.user

          assert_difference -> { ProjectPin.count }, 0 do
            delete organization_pin_path(@org.slug, @pin.public_id)
          end

          assert_response :no_content

          assert_predicate @pin.reload, :discarded?
        end

        test "returns 403 when pinning to a private project without membership" do
          @project.update(private: true)

          sign_in @member.user

          assert_difference -> { ProjectPin.count }, 0 do
            delete organization_pin_path(@org.slug, @pin.public_id)
          end

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)

          assert_difference -> { ProjectPin.count }, 0 do
            delete organization_pin_path(@org.slug, @pin.public_id)
          end

          assert_response :forbidden
        end

        test "returns 401 for unauthorized user" do
          assert_difference -> { ProjectPin.count }, 0 do
            delete organization_pin_path(@org.slug, @pin.public_id)
          end

          assert_response :unauthorized
        end
      end
    end
  end
end
