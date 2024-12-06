# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class SubscriptionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @org_admin = create(:organization_membership).user
          @organization = @org_admin.organizations.first
          @project = create(:project, organization: @organization)
        end

        context "#create" do
          test "works for org admin" do
            sign_in @org_admin
            post organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :created
            assert_response_gen_schema
            assert @project.subscribers.include?(@org_admin)
            assert_not_predicate @project.subscriptions.find_by(user: @org_admin), :cascade?
          end

          test "sets cascade true" do
            sign_in @org_admin
            post organization_project_subscription_path(@organization.slug, @project.public_id), params: { cascade: "true" }

            assert_response :created
            assert_response_gen_schema
            assert @project.subscribers.include?(@org_admin)
            assert_predicate @project.subscriptions.find_by(user: @org_admin), :cascade?
            assert_enqueued_sidekiq_job(ResetPostSubscriptionsForProjectJob, args: [@org_admin.id, @project.id])
          end

          test "does not reset post subscriptions if project subscription cascade setting did not change" do
            @project.subscriptions.create!(user: @org_admin, cascade: true)

            sign_in @org_admin
            post organization_project_subscription_path(@organization.slug, @project.public_id), params: { cascade: "true" }

            assert_response :created
            assert_response_gen_schema
            refute_enqueued_sidekiq_job(ResetPostSubscriptionsForProjectJob)
          end

          test "works for org member" do
            user = create(:organization_membership, :member, organization: @organization).user

            sign_in user
            post organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :created
            assert_response_gen_schema
            assert @project.subscribers.include?(user)
          end

          test "updates subscription if already subscribed" do
            @project.subscriptions.create(user: @org_admin)

            sign_in @org_admin
            post organization_project_subscription_path(@organization.slug, @project.public_id, params: { cascade: true })

            assert_response :created
            assert_response_gen_schema
            assert @project.subscribers.include?(@org_admin)
            assert_predicate @project.subscriptions.find_by(user: @org_admin), :cascade?
          end

          test "returns 403 for a random user" do
            rando = create(:user)

            sign_in rando
            post organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "works for org admin" do
            @project.subscriptions.create(user: @org_admin)

            sign_in @org_admin
            delete organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not @project.subscribers.include?(@org_admin)
            assert_enqueued_sidekiq_job(ResetPostSubscriptionsForProjectJob, args: [@org_admin.id, @project.id])
          end

          test "works for org member" do
            user = create(:organization_membership, :member, organization: @organization).user
            @project.subscriptions.create(user: user)

            sign_in user
            delete organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not @project.subscribers.include?(user)
          end

          test "returns a 404 if not subscribed" do
            sign_in @org_admin
            delete organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :not_found
          end

          test "returns 403 for a random user" do
            rando = create(:user)

            sign_in rando
            delete organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_project_subscription_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
