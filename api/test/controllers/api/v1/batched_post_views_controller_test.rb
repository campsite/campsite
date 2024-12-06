# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class BatchedPostViewsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @ip = "1.2.3.4"
        @user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      end

      context "#create" do
        test "it queues views in batches" do
          post = create(:post, organization: @member.organization)
          views = [
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 1 },
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
          ]

          sign_in @member.user

          post batched_post_views_path, params: { views: views }, as: :json, headers: { "HTTP_FLY_CLIENT_IP" => @ip, "HTTP_USER_AGENT" => @user_agent }

          assert_response :no_content
          assert_enqueued_sidekiq_job(
            PostViewsJob,
            args: [
              views.as_json,
              @member.user.id,
              @ip,
              @user_agent,
            ],
            count: 1,
          )
        end

        test "it queues events in slices if there are many" do
          post = create(:post, organization: @member.organization)
          views = [
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 1 },
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
            { member_id: @member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
          ] * 10

          sign_in @member.user

          post batched_post_views_path, params: { views: views }, as: :json, headers: { "HTTP_FLY_CLIENT_IP" => @ip, "HTTP_USER_AGENT" => @user_agent }

          assert_response :no_content
          assert_enqueued_sidekiq_jobs(2, only: PostViewsJob)
        end
      end
    end
  end
end
