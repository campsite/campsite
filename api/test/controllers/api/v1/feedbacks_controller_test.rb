# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class FeedbacksControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @user = create(:organization_membership, organization: @organization).user
      end

      context "#create" do
        test "creates feedback" do
          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: "this is a bug",
              feedback_type: "bug",
              current_url: "https://www.example.com",
            }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last
          assert_not feedback.nil?

          assert_equal @user, feedback.user
          assert_equal "this is a bug", feedback.description
          assert_equal @organization, feedback.organization
          assert_equal "https://www.example.com", feedback.current_url
          assert_equal "bug", feedback.feedback_type
          assert_enqueued_sidekiq_job(SendFeedbackToPlainJob, args: [feedback.id])
          refute_enqueued_sidekiq_job(LinearIssueJob, args: [feedback.id])
        end

        test "sends staff feedback to Linear" do
          user = create(:organization_membership, organization: @organization, user: create(:user, :staff)).user

          sign_in user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: "this is a bug",
              feedback_type: "bug",
              current_url: "https://www.example.com",
            }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last
          refute_enqueued_sidekiq_job(SendFeedbackToPlainJob, args: [feedback.id])
          assert_enqueued_sidekiq_job(LinearIssueJob, args: [feedback.id])
        end

        test "gracefully handles long descriptions" do
          description = "a" * 2_000

          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: description,
              feedback_type: "bug",
              current_url: "https://www.example.com",
            }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last!
          assert_includes feedback.description, description
        end

        test "includes device info for desktop app" do
          description = "Description"

          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: description,
              feedback_type: "bug",
              current_url: "https://www.example.com",
            },
            headers: { "HTTP_USER_AGENT": "Foo Bar Campsite/123.0.1 Dog Cat" }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last!
          assert_equal "Desktop App 123.0.1", feedback.browser_info
          assert_equal "Unknown", feedback.os_info
        end

        test "includes device info for non-desktop app device" do
          description = "Description"

          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: description,
              feedback_type: "bug",
              current_url: "https://www.example.com",
            },
            headers: { "HTTP_USER_AGENT": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148" }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last!
          assert_equal "Mobile Safari  (Apple smartphone)", feedback.browser_info
          assert_equal "iOS 12.2", feedback.os_info
        end

        test "missing description" do
          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              feedback_type: "bug",
              current_url: "https://www.example.com",
            }

          assert_response :unprocessable_entity
        end

        test "missing url" do
          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: "this is a bug",
              feedback_type: "bug",
            }

          assert_response :unprocessable_entity
        end

        test "missing type" do
          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: "this is a bug",
              current_url: "https://www.example.com",
            }

          assert_response :unprocessable_entity
        end

        test "creates feedback with screenshot path" do
          sign_in @user
          post organization_feedbacks_path(@organization.slug),
            params: {
              description: "this is a bug",
              feedback_type: "bug",
              current_url: "https://www.example.com",
              screenshot_path: "/screenshot.png",
            }

          assert_response :created
          assert_response_gen_schema

          feedback = Feedback.last
          assert_equal "/screenshot.png", feedback.screenshot_path
        end
      end
    end
  end
end
