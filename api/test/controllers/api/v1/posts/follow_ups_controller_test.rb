# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class FollowUpsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @post = create(:post, organization: @organization)
        end

        context "#create" do
          test "member can create follow up for post" do
            Timecop.freeze do
              sign_in @user

              assert_query_count 13 do
                post organization_post_follow_up_path(@organization.slug, @post.public_id),
                  params: { show_at: 1.hour.from_now.iso8601 }
              end

              assert_response_gen_schema
              assert_response :created
              assert_in_delta 1.hour.from_now, Time.zone.parse(json_response["show_at"]), 2.seconds
              assert_enqueued_sidekiq_job(ShowFollowUpJob, args: [FollowUp.last.id], at: Time.zone.parse(json_response["show_at"]))
            end
          end

          test "discards inbox notifications" do
            other_member = create(:organization_membership, organization: @organization)
            post = create(:post, organization: @organization, member: @member)
            post.events.first!.process!

            comment = create(:comment, subject: post, member: other_member)
            comment.events.first!.process!

            reaction = create(:reaction, subject: post, member: other_member)
            reaction.events.first!.process!

            comment_notification = comment.notifications.first!
            reaction_notification = reaction.notifications.first!

            assert_not_predicate comment_notification, :discarded?
            assert_not_predicate reaction_notification, :discarded?

            sign_in @user

            post organization_post_follow_up_path(@organization.slug, post.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_predicate comment_notification.reload, :discarded?
            assert_not_predicate reaction_notification.reload, :discarded?
          end

          test "member can't create post follow up without a show_at" do
            sign_in @user
            post organization_post_follow_up_path(@organization.slug, @post.public_id)

            assert_response :unprocessable_entity
          end

          test "member can't create follow up for post in private project they don't belong to" do
            @post.update!(project: create(:project, :private, organization: @organization))

            sign_in @user
            post organization_post_follow_up_path(@organization.slug, @post.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_response :forbidden
          end

          test "non-org member can't create follow up" do
            sign_in create(:user)
            post organization_post_follow_up_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "logged-out user can't create follow up" do
            post organization_post_follow_up_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_follow_up_path(@organization.slug, post.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_response :not_found
          end
        end
      end
    end
  end
end
