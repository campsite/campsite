# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Comments
      class FollowUpsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @post = create(:post, organization: @organization)
          @comment = create(:comment, subject: @post)
        end

        context "#create" do
          test "member can create follow up for comment" do
            Timecop.freeze do
              sign_in @user

              assert_query_count 20 do
                post organization_comment_follow_up_path(@organization.slug, @comment.public_id),
                  params: { show_at: 1.hour.from_now.iso8601 }
              end

              assert_response_gen_schema
              assert_response :created
              assert_in_delta 1.hour.from_now, Time.zone.parse(json_response["show_at"]), 2.seconds
              assert_enqueued_sidekiq_job(ShowFollowUpJob, args: [FollowUp.last.id], at: Time.zone.parse(json_response["show_at"]))
            end
          end

          test "discards inbox notifications" do
            post = create(:post, organization: @organization, member: @member)
            comment = create(:comment, subject: post)

            other_member = create(:organization_membership, organization: @organization)
            reaction = create(:reaction, subject: comment, member: other_member)
            reaction.events.first!.process!
            comment.events.first!.process!

            reaction_notification = reaction.notifications.first!
            comment_notification = comment.notifications.first!

            assert_not_predicate reaction_notification, :discarded?
            assert_not_predicate comment_notification, :discarded?

            sign_in @user

            post organization_comment_follow_up_path(@organization.slug, comment.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_not_predicate reaction_notification.reload, :discarded?
            assert_predicate comment_notification.reload, :discarded?
          end

          test "member can't create comment follow up without a show_at" do
            sign_in @user
            post organization_comment_follow_up_path(@organization.slug, @comment.public_id)

            assert_response :unprocessable_entity
          end

          test "member can't create follow up for comment on a post in private project they don't belong to" do
            @post.update!(project: create(:project, :private, organization: @organization))

            sign_in @user
            post organization_comment_follow_up_path(@organization.slug, @comment.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_response :forbidden
          end

          test "non-org member can't create follow up" do
            sign_in create(:user)
            post organization_comment_follow_up_path(@organization.slug, @comment.public_id)

            assert_response :forbidden
          end

          test "logged-out user can't create follow up" do
            post organization_comment_follow_up_path(@organization.slug, @comment.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
