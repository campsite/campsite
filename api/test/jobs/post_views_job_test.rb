# frozen_string_literal: true

require "test_helper"

class PostViewsJobTest < ActiveJob::TestCase
  context "perform" do
    test "it logs multiple views" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      views = [
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 1 },
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
      ]

      assert_difference -> { PostView.count }, 1 do
        PostViewsJob.new.perform(views.as_json, member.user.id, "", "")
      end

      view = PostView.where(post: post).first
      assert_equal 3, view.reads_count
      assert_equal 6, view.dwell_time_total
    end

    test "it logs multiple views from multiple members on multiple posts" do
      member1 = create(:organization_membership)
      post11 = create(:post, organization: member1.organization)
      member2 = create(:organization_membership, user: member1.user)
      post21 = create(:post, organization: member2.organization)
      post22 = create(:post, organization: member2.organization)
      views = [
        { member_id: member1.public_id, post_id: post11.public_id, log_ts: Time.current.to_i, read: false, dwell_time: 1 },
        { member_id: member1.public_id, post_id: post11.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
        { member_id: member2.public_id, post_id: post21.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
        { member_id: member2.public_id, post_id: post22.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 4 },
      ]

      assert_difference -> { PostView.count }, 3 do
        PostViewsJob.new.perform(views.as_json, member1.user.id, "", "")
      end

      views = PostView.where(member: member1)
      assert_equal 1, views.count
      assert_equal 1, views.first.reads_count
      assert_equal 3, views.first.dwell_time_total
      assert_equal 2, PostView.where(member: member2).count
    end

    test "it handles missing log_ts" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      views = [
        { member_id: member.public_id, post_id: post.public_id, log_ts: nil, read: true, dwell_time: 1 },
      ]

      assert_difference -> { PostView.count }, 1 do
        PostViewsJob.new.perform(views.as_json, member.user.id, "", "")
      end
    end

    test "it logs views and non-member views" do
      ip = "1.2.3.4"
      user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      views = [
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: false, dwell_time: 1 },
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
        { post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
        { post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 4 },
      ]

      PostViewsJob.new.perform(views.as_json, member.user.id, ip, user_agent)

      assert_equal 1, PostView.count
      assert_equal 1, NonMemberPostView.count
    end

    test "it falls back to ip if no user_id" do
      ip = "1.2.3.4"
      user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      views = [
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: false, dwell_time: 1 },
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 2 },
        { post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 3 },
        { post_id: post.public_id, log_ts: Time.current.to_i, read: true, dwell_time: 4 },
      ]

      PostViewsJob.new.perform(views.as_json, nil, ip, user_agent)

      assert_equal 1, PostView.count
      assert_equal 1, NonMemberPostView.count
    end

    test "it caps dwell time" do
      member = create(:organization_membership)
      post = create(:post, organization: member.organization)
      views = [
        { member_id: member.public_id, post_id: post.public_id, log_ts: Time.current.to_i, read: false, dwell_time: 2328077038 },
      ]

      PostViewsJob.new.perform(views.as_json, nil, "", "")

      assert_equal 1, PostView.count
    end
  end
end
