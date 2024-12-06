# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostViewsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_member = create(:organization_membership)
          @user = @user_member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization, member: @user_member)
        end

        context "#index" do
          setup do
            create(:post_view, :read, post: @post)
            create(:post_view, :read, post: @post)
          end

          test "works for org admin" do
            sign_in @user
            get organization_post_views_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_post_views_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "includes views for posts created by an oauth application" do
            post = create(:post, :from_oauth_application, organization: @organization)
            create(:post_view, :read, post: post)

            sign_in @user
            get organization_post_views_path(@organization.slug, post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response["data"].length
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_views_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "works for a random user on a public post" do
            @post.update!(visibility: :public)

            sign_in create(:user)
            get organization_post_views_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "return 403 for an unauthenticated user" do
            get organization_post_views_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "works for an unauthenticated user on a public post" do
            @post.update!(visibility: :public)

            get organization_post_views_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            get organization_post_views_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end

        context "#create" do
          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, @post.reload.views_count
          end

          test "older clients without read still mark read" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, @post.reload.views_count
          end

          test "does not increase views for non-reads" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: false }, as: :json
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 0, @post.reload.views_count
          end

          test "marks as read notifications where the target is this post" do
            other_member = create(:organization_membership, :member, organization: @organization)
            notification = create(:notification, organization_membership: other_member, target: @post)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json
            end

            assert_response :ok
            assert_response_gen_schema
            assert_predicate notification.reload, :read?
          end

          test "does not mark notifications unless view is marked read" do
            other_member = create(:organization_membership, :member, organization: @organization)
            notification = create(:notification, organization_membership: other_member, target: @post)

            sign_in other_member.user
            post organization_post_views_path(@organization.slug, @post.public_id), params: { read: false }, as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_not_predicate notification.reload, :read?
          end

          test "sets last_seen_at on the user and organization membership" do
            Timecop.freeze do
              other_member = create(:organization_membership, :member, organization: @organization)

              sign_in other_member.user
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json

              assert_response :ok
              assert_response_gen_schema
              # assert_enqueued_sidekiq_job UpdateUserLastSeenAtJob, args: [other_member.user.id]
              assert_enqueued_sidekiq_job UpdateOrganizationMembershipLastSeenAtJob, args: [other_member.id]
            end
          end

          test "doesn't mark as read notifications when view comes from the inbox" do
            other_member = create(:organization_membership, :member, organization: @organization)
            notification = create(:notification, organization_membership: other_member, target: @post)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id, params: { context: "inbox", read: true }, as: :json)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_not_predicate notification.reload, :read?
          end

          test "doesn't create PostView if one already exists for user and post" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:post_view, post: @post, member: other_member)

            sign_in other_member.user
            assert_difference -> { PostView.count }, 0 do
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json
            end

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json
            assert_response :forbidden
          end

          test "creates a NonMemberPostView for a random user for a public post" do
            @post.update!(visibility: :public)
            user = create(:user)

            sign_in user
            assert_difference -> { NonMemberPostView.count }, 1 do
              post organization_post_views_path(@organization.slug, @post.public_id), headers: { "HTTP_FLY_CLIENT_IP" => "1.2.3.4" }
            end

            assert_response :ok
            assert_response_gen_schema
            assert @post.reload.non_member_views.exists?(user: user)
            assert_equal 1, @post.non_member_views_count
          end

          test "updates updated_at for existing random user view" do
            Timecop.freeze do
              @post.update!(visibility: :public)
              user = create(:user)
              view = create(:non_member_post_view, post: @post, user: user, updated_at: 1.month.ago)

              sign_in user
              assert_difference -> { NonMemberPostView.count }, 0 do
                post organization_post_views_path(@organization.slug, @post.public_id), headers: { "HTTP_FLY_CLIENT_IP" => "1.2.3.4" }
              end

              assert_response :ok
              assert_response_gen_schema
              assert_in_delta Time.current, view.reload.updated_at, 2.seconds
              assert_equal 1, @post.reload.non_member_views_count
            end
          end

          test "return 403 for an unauthenticated user" do
            post organization_post_views_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "creates a NonMemberPostView for an unauthenticated user for a public post" do
            ip = "1.2.3.4"
            user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            @post.update!(visibility: :public)

            assert_difference -> { NonMemberPostView.count }, 1 do
              post organization_post_views_path(@organization.slug, @post.public_id), headers: { "HTTP_FLY_CLIENT_IP" => ip, "HTTP_USER_AGENT" => user_agent }
            end

            assert_response :ok
            assert_response_gen_schema
            assert @post.reload.non_member_views.exists?(anonymized_ip: IpAnonymizer.mask_ip(ip), user_agent: user_agent)
            assert_equal 1, @post.non_member_views_count
          end

          test "updates updated_at for existing unauthenticated user view" do
            Timecop.freeze do
              ip = "1.2.3.4"
              user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
              @post.update!(visibility: :public)
              view = create(:non_member_post_view, post: @post, anonymized_ip: IpAnonymizer.mask_ip(ip), user_agent: user_agent, updated_at: 1.month.ago)

              assert_difference -> { NonMemberPostView.count }, 0 do
                post organization_post_views_path(@organization.slug, @post.public_id), headers: { "HTTP_FLY_CLIENT_IP" => ip, "HTTP_USER_AGENT" => user_agent }
              end

              assert_response :ok
              assert_response_gen_schema
              assert_in_delta Time.current, view.reload.updated_at, 2.seconds
              assert_equal 1, @post.reload.non_member_views_count
            end
          end

          test "creates a new NonMemberPostView when IP matches but user agent is different" do
            ip = "1.2.3.4"
            new_user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            @post.update!(visibility: :public)
            create(:non_member_post_view, post: @post, anonymized_ip: IpAnonymizer.mask_ip(ip), user_agent: "Old/User agent")

            assert_difference -> { NonMemberPostView.count }, 1 do
              post organization_post_views_path(@organization.slug, @post.public_id), headers: { "HTTP_FLY_CLIENT_IP" => ip, "HTTP_USER_AGENT" => new_user_agent }
            end

            assert_response :ok
            assert_response_gen_schema
            assert @post.reload.non_member_views.exists?(anonymized_ip: IpAnonymizer.mask_ip(ip), user_agent: new_user_agent)
            assert_equal 2, @post.non_member_views_count
          end

          test "touches updated_at if already viewed" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            assert_difference -> { PostView.count } do
              post organization_post_views_path(@organization.slug, @post.public_id), params: { read: true }, as: :json
            end

            view_updated_at = PostView.last.updated_at

            assert_not view_updated_at.nil?
            assert_response :ok
            assert_response_gen_schema

            post organization_post_views_path(@organization.slug, @post.public_id), params: { read: false }, as: :json

            assert view_updated_at < PostView.last.updated_at
            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_views_path(@organization.slug, post.public_id), params: { read: true }, as: :json

            assert_response :not_found
          end
        end
      end
    end
  end
end
