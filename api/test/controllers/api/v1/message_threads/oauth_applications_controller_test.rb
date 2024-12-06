# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class OauthApplicationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership, :admin)
          @organization = @member.organization
          @thread = create(:message_thread, :group, owner: @member)
          @oauth_application = create(:oauth_application, owner: @organization)

          @thread_non_member = create(:organization_membership, organization: @organization)

          @thread_with_guest = create(:message_thread, :group, owner: @member)
          @guest_member = create(:organization_membership, :guest, organization: @organization)
          @thread_with_guest.update_other_organization_memberships!(other_organization_memberships: [@guest_member], actor: @member)
        end

        context "#index" do
          setup do
            @path = organization_thread_oauth_applications_path(@organization.slug, @thread.public_id)
          end

          test "returns a list of oauth applications" do
            @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)

            sign_in @member.user
            get @path

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response.size
            assert_nil json_response[0]["secret"]
          end

          test "does not work for a thread you do not have access to" do
            sign_in @thread_non_member.user
            get @path
            assert_response :forbidden
          end

          test "does not work for guests" do
            sign_in @guest_member.user
            get organization_thread_oauth_applications_path(@organization.slug, @thread_with_guest.public_id)
            assert_response :forbidden
          end

          test "does not return discarded oauth applications" do
            @oauth_application.discard

            sign_in @member.user
            get @path

            assert_response :ok
            assert_response_gen_schema
            assert_equal 0, json_response.size
          end

          test "returns 401 for an unauthenticated user" do
            get @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get @path
            assert_response :forbidden
          end
        end

        context "#create" do
          setup do
            @path = organization_thread_oauth_applications_path(@organization.slug, @thread.public_id)
          end

          test "adds an oauth application to the thread" do
            sign_in @member.user

            assert_difference -> { @thread.oauth_applications.count }, 1 do
              post @path, params: { oauth_application_id: @oauth_application.public_id }
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal @thread.oauth_applications.last.public_id, @oauth_application.public_id
          end

          test "does not add the same oauth application twice" do
            sign_in @member.user

            @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)

            assert_no_difference -> { @thread.oauth_applications.count } do
              post @path, params: { oauth_application_id: @oauth_application.public_id }
            end
          end

          test "does not work for an oauth application that does not belong to the organization" do
            oauth_application = create(:oauth_application, owner: create(:organization))

            sign_in @member.user
            post @path, params: { oauth_application_id: oauth_application.public_id }

            assert_response :not_found
          end

          test "does not work for a thread you do not have access to" do
            sign_in @thread_non_member.user
            post @path
            assert_response :forbidden
          end

          test "guests cannot add oauth applications to threads" do
            sign_in @guest_member.user
            post organization_thread_oauth_applications_path(@organization.slug, @thread_with_guest.public_id),
              params: { oauth_application_id: @oauth_application.public_id }

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            post @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post @path
            assert_response :forbidden
          end
        end

        context "#destroy" do
          setup do
            @path = organization_thread_oauth_application_path(@organization.slug, @thread.public_id, @oauth_application.public_id)
          end

          test "removes an oauth application from a thread" do
            sign_in @member.user

            @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)

            assert_difference -> { @thread.reload.oauth_applications.count }, -1 do
              delete @path
            end

            assert_response :no_content
            assert_equal 0, @thread.reload.oauth_applications.count
          end

          test "does not work for a thread you do not have access to" do
            sign_in @thread_non_member.user
            delete @path
            assert_response :forbidden
          end

          test "does not work for guests" do
            sign_in @guest_member.user
            delete organization_thread_oauth_application_path(@organization.slug, @thread_with_guest.public_id, @oauth_application.public_id)

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            delete @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            delete @path
            assert_response :forbidden
          end
        end
      end
    end
  end
end
