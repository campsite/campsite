# frozen_string_literal: true

class PostViewsJob < BaseJob
  sidekiq_options queue: "background"

  def perform(views, user_id, remote_ip, user_agent)
    # max dwell_time at 30 minutes in milliseconds to fix corrupted data
    views = views.map do |view|
      view["dwell_time"] = [view["dwell_time"], 1000 * 60 * 30].min if view["dwell_time"]
      view
    end

    member_views, non_member_views = views.partition { |view| view["member_id"] }

    member_views = member_views.map do |view|
      {
        post_id: view["post_id"],
        member_id: view["member_id"],
        read: !!view["read"],
        dwell_time: view["dwell_time"],
        updated_at: Time.zone.at(view["log_ts"].to_i),
      }
    end
    PostView.upsert_post_views(views: member_views)

    non_member_posts = Post.where(public_id: views.pluck("post_id")).index_by(&:public_id)
    non_member_views.each do |view|
      post = non_member_posts[view["post_id"]]
      user = User.find(user_id) if user_id
      NonMemberPostView.find_or_create_from_request!(post: post, user: user, remote_ip: remote_ip, user_agent: user_agent)
    end
  end
end

PostViewsJob2 = PostViewsJob
