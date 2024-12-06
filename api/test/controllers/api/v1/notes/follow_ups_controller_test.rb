# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class FollowUpsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @note = create(:note, member: @member)
        end

        context "#create" do
          test "member can create follow up for note" do
            Timecop.freeze do
              sign_in @user

              assert_query_count 13 do
                post organization_note_follow_up_path(@organization.slug, @note.public_id),
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
            note = create(:note, member: other_member)

            permission = create(:permission, user: other_member.user, subject: note, action: :edit)
            permission.events.first!.process!

            create(:user_subscription, user: @member.user, subscribable: note)

            comment = create(:comment, subject: note, member: create(:organization_membership, organization: @organization))
            comment.events.first!.process!

            permission_notification = permission.notifications.first!
            comment_notification = comment.notifications.first!

            assert_not_predicate permission_notification, :discarded?
            assert_not_predicate comment_notification, :discarded?

            sign_in @user

            post organization_note_follow_up_path(@organization.slug, note.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_not_predicate permission_notification.reload, :discarded?
            assert_not_predicate comment_notification.reload, :discarded?
          end

          test "member can't create note follow up without a show_at" do
            sign_in @user
            post organization_note_follow_up_path(@organization.slug, @note.public_id)

            assert_response :unprocessable_entity
          end

          test "member can't create follow up for note they don't have access to" do
            sign_in create(:organization_membership, organization: @organization).user
            post organization_note_follow_up_path(@organization.slug, @note.public_id),
              params: { show_at: 1.hour.from_now.iso8601 }

            assert_response :forbidden
          end

          test "non-org member can't create follow up" do
            sign_in create(:user)
            post organization_note_follow_up_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "logged-out user can't create follow up" do
            post organization_note_follow_up_path(@organization.slug, @note.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
