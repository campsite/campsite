# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class FollowUpsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @call = create(:call, room: create(:call_room, organization: @organization))
          @call_peer = create(:call_peer, organization_membership: @member, call: @call)
        end

        context "#create" do
          test "call participant can create follow up for call" do
            Timecop.freeze do
              sign_in @user

              assert_query_count 19 do
                post organization_call_follow_up_path(@organization.slug, @call.public_id),
                  params: { show_at: 1.hour.from_now.iso8601 }
              end

              assert_response_gen_schema
              assert_response :created
              assert_in_delta 1.hour.from_now, Time.zone.parse(json_response["show_at"]), 2.seconds
              assert_enqueued_sidekiq_job(ShowFollowUpJob, args: [FollowUp.last.id], at: Time.zone.parse(json_response["show_at"]))
            end
          end

          test "call participant can't create comment follow up without a show_at" do
            sign_in @user
            post organization_call_follow_up_path(@organization.slug, @call.public_id)

            assert_response :unprocessable_entity
          end

          test "member can't create follow up for a call they don't have access to" do
            @call_peer.destroy!

            sign_in @user
            post organization_call_follow_up_path(@organization.slug, @call.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_response :forbidden
          end

          test "non-org member can't create follow up" do
            sign_in create(:user)
            post organization_call_follow_up_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "logged-out user can't create follow up" do
            post organization_call_follow_up_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
