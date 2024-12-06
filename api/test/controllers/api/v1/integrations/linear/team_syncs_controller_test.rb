# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Linear
        class TeamSyncsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @organization = @member.organization
            @integration = create(:integration, :linear, owner: @organization)
          end

          describe "#create" do
            test "enqueues Linear team sync job for organization member" do
              sign_in @member.user
              post organization_integrations_linear_team_syncs_path(@organization.slug)

              assert_response :no_content
              assert_enqueued_sidekiq_job(::Integrations::Linear::SyncTeamsJob, { args: [@integration.id] })
            end

            test "does not enqueue Linear team sync job if no Linear integration" do
              member = create(:organization_membership)

              sign_in member.user
              post organization_integrations_linear_team_syncs_path(member.organization.slug)

              assert_response :no_content
              refute_enqueued_sidekiq_job(::Integrations::Linear::SyncTeamsJob)
            end

            it "returns forbidden for non-organization member" do
              sign_in create(:user)
              post organization_integrations_linear_team_syncs_path(@organization.slug)

              assert_response :forbidden
            end

            it "returns unauthorized for logged-out user" do
              post organization_integrations_linear_team_syncs_path(@organization.slug)

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
