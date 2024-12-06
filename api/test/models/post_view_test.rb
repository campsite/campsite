# frozen_string_literal: true

require "test_helper"

class PostViewTest < ActiveSupport::TestCase
  context "#not_post_author?" do
    test "returns true when not the author" do
      post = create(:post)
      view = create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))

      assert_predicate view, :counted_read?
    end

    test "returns false when not the author and not read" do
      post = create(:post)
      view = create(:post_view, post: post, member: create(:organization_membership, organization: post.organization))

      assert_not_predicate view, :counted_read?
    end

    test "returns false when the post author" do
      post = create(:post)
      view = create(:post_view, :read, post: post, member: post.member)

      assert_not_predicate view, :counted_read?
    end
  end

  context "#counted_reads_scope" do
    test "excludes views from the post author" do
      post = create(:post)
      view1 = create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))
      create(:post_view, :read, post: post, member: post.member)
      view3 = create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))

      scope = PostView.counted_reads.where(post: post)
      assert_equal [view1, view3], scope
    end

    test "excludes non-read views" do
      post = create(:post)
      view1 = create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))
      create(:post_view, post: post, member: create(:organization_membership, organization: post.organization))
      view3 = create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))

      scope = PostView.counted_reads.where(post: post)
      assert_equal [view1, view3], scope
    end
  end

  context "#counter_culture" do
    test "counter only includes non-author views" do
      post = create(:post)
      create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))
      create(:post_view, :read, post: post, member: post.member)
      create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))

      assert_equal 2, post.reload.views_count
    end

    test "counter does not include non-reads" do
      post = create(:post)
      create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))
      create(:post_view, post: post, member: create(:organization_membership, organization: post.organization))
      create(:post_view, :read, post: post, member: create(:organization_membership, organization: post.organization))

      assert_equal 2, post.reload.views_count
    end

    test "fix only includes non-author reads" do
      post1 = create(:post)
      post2 = create(:post)
      post3 = create(:post)
      PostView.skip_counter_culture_updates do
        create(:post_view, :read, post: post1, member: create(:organization_membership, organization: post1.organization))
        create(:post_view, :read, post: post1, member: post1.member)
        create(:post_view, post: post1, member: create(:organization_membership, organization: post1.organization))
        create(:post_view, :read, post: post1, member: create(:organization_membership, organization: post1.organization))

        create(:post_view, :read, post: post2, member: post2.member)
        create(:post_view, post: post2, member: create(:organization_membership, organization: post1.organization))

        create(:post_view, :read, post: post3, member: create(:organization_membership, organization: post3.organization))
        create(:post_view, :read, post: post3, member: create(:organization_membership, organization: post3.organization))
      end

      assert_equal 0, post1.reload.views_count
      assert_equal 0, post2.reload.views_count
      assert_equal 0, post3.reload.views_count

      PostView.counter_culture_fix_counts

      assert_equal 2, post1.reload.views_count
      assert_equal 0, post2.reload.views_count
      assert_equal 2, post3.reload.views_count
    end

    test "upsert updates counts" do
      post1, post2, post3 = create_list(:post, 3)

      member1, member2, member3, member4 = create_list(:organization_membership, 4, organization: post1.organization)
      member5, member6 = create_list(:organization_membership, 2, organization: post3.organization)

      PostView.upsert_post_views(views: [
        { member_id: member1.public_id, post_id: post1.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },
        { member_id: post1.member.public_id, post_id: post1.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },
        { member_id: member2.public_id, post_id: post1.public_id, read: false, log_ts: Time.current.to_i, dwell_time: 1 },
        { member_id: member3.public_id, post_id: post1.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },

        { member_id: post2.member.public_id, post_id: post2.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },
        { member_id: member4.public_id, post_id: post2.public_id, read: false, log_ts: Time.current.to_i, dwell_time: 1 },

        { member_id: member5.public_id, post_id: post3.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },
        { member_id: member6.public_id, post_id: post3.public_id, read: true, log_ts: Time.current.to_i, dwell_time: 1 },
      ])

      assert_equal 2, post1.reload.views_count
      assert_equal 0, post2.reload.views_count
      assert_equal 2, post3.reload.views_count
    end

    test "upserting retains last read_at" do
      post = create(:post)
      member = create(:organization_membership, organization: post.organization)

      create(:post_view, :read, post: post, member: member)

      assert_equal 1, post.reload.views_count

      PostView.upsert_post_views(views: [
        { member_id: member.public_id, post_id: post.public_id, read: false, log_ts: Time.current.to_i, dwell_time: 1 },
      ])

      assert_equal 1, post.reload.views_count
    end
  end

  context "#upsert_post_views" do
    test "upserting a missing post noops" do
      member = create(:organization_membership)

      assert_nothing_raised do
        PostView.upsert_post_views(views: [
          { member_id: member.public_id, post_id: "nothin", read: true, log_ts: Time.current.to_i, dwell_time: 1 },
        ])
      end
    end

    test "upserting drops dupes" do
      post = create(:post)

      member = create(:organization_membership, organization: post.organization)
      time = Time.current.to_i

      assert_difference -> { PostView.count }, 1 do
        PostView.upsert_post_views(views: [
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 1 },
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 1 },
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 1 },
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 1 },
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 1 },
          { member_id: member.public_id, post_id: post.public_id, read: true, log_ts: time, dwell_time: 2 },
        ])
      end

      assert_equal 1, post.reload.views_count
      assert_equal 3, post.views.first.dwell_time_total
    end
  end
end
