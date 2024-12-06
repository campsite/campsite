# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OauthApplicationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @admin = create(:organization_membership, :admin)
        @org = @admin.organization
        @guest = create(:organization_membership, :guest, organization: @org)
      end

      context "#index" do
        test "lists oauth applications" do
          create_list(:oauth_application, 2, owner: @org)
          create(:oauth_application, owner: @org, discarded_at: 5.minutes.ago)
          create(:oauth_application)

          sign_in @admin.user

          list_oauth_apps

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response.length
        end

        test "does not work for guests" do
          sign_in @guest.user
          list_oauth_apps
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          list_oauth_apps
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          list_oauth_apps
          assert_response :unauthorized
        end

        def list_oauth_apps
          get(organization_oauth_applications_path(@org.slug), as: :json)
        end
      end

      context "#create" do
        test "creates an oauth application" do
          sign_in @admin.user

          create_oauth_app

          assert_response :created
          assert_response_gen_schema
          assert_equal "Test App", json_response["name"]

          oauth_app = OauthApplication.last
          assert_equal json_response["id"], oauth_app.public_id
          assert_equal @org, oauth_app.owner
          assert_equal @admin.id, oauth_app.creator_id
        end

        test "does not work for guests" do
          sign_in @guest.user
          create_oauth_app
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          create_oauth_app
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          create_oauth_app
          assert_response :unauthorized
        end

        def create_oauth_app
          post(organization_oauth_applications_path(@org.slug), params: { name: "Test App" }, as: :json)
        end
      end

      context "#update" do
        setup do
          @oauth_app = create(:oauth_application, owner: @org)
        end

        test "updates an oauth application" do
          sign_in @admin.user

          update_oauth_app

          assert_response :ok
          assert_response_gen_schema
          assert_equal "Updated App", json_response["name"]
          assert_equal "https://new-example.com", json_response["redirect_uri"]
        end

        test "updates webhooks" do
          sign_in @admin.user

          w1 = create(:webhook, owner: @oauth_app, creator: @admin, url: "https://example.com/webhook")
          w2 = create(:webhook, owner: @oauth_app, creator: @admin, url: "https://example.com/webhook2")

          put(
            organization_oauth_application_path(@org.slug, @oauth_app.public_id),
            params: {
              webhooks: [
                { id: w1.public_id, url: "https://example.com/different-url", event_types: ["comment.created"] },
                { url: "https://new-example.com/webhook2", event_types: ["post.created", "comment.created"] },
              ],
            },
            as: :json,
          )

          assert_response :ok
          assert_response_gen_schema
          assert w1.reload.kept?
          assert_not w2.reload.kept?
          assert_equal ["https://example.com/different-url", "https://new-example.com/webhook2"], json_response["webhooks"].pluck("url")
          assert_equal "https://example.com/different-url", w1.reload.url
          assert_equal "https://new-example.com/webhook2", @oauth_app.reload.active_webhooks.last.url
          assert @oauth_app.active_webhooks.last.includes_event_type?("post.created")
          assert @oauth_app.active_webhooks.first.includes_event_type?("comment.created")
        end

        test "does not work for guests" do
          sign_in @guest.user
          update_oauth_app
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          update_oauth_app
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          update_oauth_app
          assert_response :unauthorized
        end

        def update_oauth_app
          put(organization_oauth_application_path(@org.slug, @oauth_app.public_id), params: { name: "Updated App", redirect_uri: "https://new-example.com" }, as: :json)
        end
      end

      context "#destroy" do
        setup do
          @oauth_app = create(:oauth_application, owner: @org)
        end

        test "deletes an oauth application" do
          sign_in @admin.user
          destroy_oauth_app
          assert_response :no_content
          assert_predicate @oauth_app.reload, :discarded?
        end

        test "does not work for guests" do
          sign_in @guest.user
          destroy_oauth_app
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          destroy_oauth_app
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          destroy_oauth_app
          assert_response :unauthorized
        end

        def destroy_oauth_app
          delete(organization_oauth_application_path(@org.slug, @oauth_app.public_id), as: :json)
        end
      end
    end
  end
end
