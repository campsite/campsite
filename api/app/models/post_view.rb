# frozen_string_literal: true

class PostView < ApplicationRecord
  include PublicIdGenerator

  belongs_to :post
  belongs_to :member, class_name: "OrganizationMembership", foreign_key: :organization_membership_id
  has_one :post_member, through: :post

  scope :counted_reads, -> do
    joins(:post)
      .where("COALESCE(post_views.organization_membership_id, 0) <> COALESCE(posts.organization_membership_id, 0)")
      .where.not(read_at: nil)
  end

  counter_culture :post,
    column_name: proc { |view| view.counted_read? ? :views_count : nil },
    column_names: -> { { PostView.counted_reads => :views_count } }

  def api_type_name
    "PostView"
  end

  def read?
    read_at.present?
  end

  def counted_read?
    post && organization_membership_id != post.organization_membership_id && read?
  end

  def self.upsert_post_view(post:, member:, read:, dwell_time: 0, time: Time.current)
    view = post.views.create_or_find_by(member: member)
    view.read_at = time if read && (view.read_at.nil? || view.read_at < time)
    view.reads_count = view.reads_count + 1 if read
    view.dwell_time_total = view.dwell_time_total + dwell_time if dwell_time
    view.updated_at = time if view.updated_at.nil? || view.updated_at < time
    view.save!
    view
  end

  def self.upsert_post_views(views:)
    views = views.uniq
    post_public_ids = views.pluck(:post_id).uniq
    member_public_ids = views.pluck(:member_id).uniq

    posts = Post.where(public_id: post_public_ids).index_by(&:public_id)
    members = OrganizationMembership.where(public_id: member_public_ids).index_by(&:public_id)

    # get all existing views matching post_id and member_id as a pair
    existing_views = if views.any?
      scope = PostView.joins(:post, :member)
      ors = views.pluck(:post_id, :member_id).uniq.map do |post_id, member_id|
        scope.where(
          post: { public_id: post_id },
          member: { public_id: member_id },
        )
      end
      scope = scope.and(ors.reduce(:or))
      scope.index_by(&:post_id)
    end
    existing_views ||= {}

    now = Time.current

    bundled_views = views.group_by { |view| [view[:post_id], view[:member_id]] }
    upsert_data = bundled_views.map do |(post_id, member_id), views|
      post = posts[post_id]
      member = members[member_id]

      next unless post && member

      updated_at = views.pluck(:updated_at).compact.max || now

      existing_view = if (existing = existing_views[post.id])
        existing
      else
        { public_id: PostView.generate_public_id, reads_count: 0, dwell_time_total: 0, created_at: now }
      end

      {
        post_id: post.id,
        organization_membership_id: member.id,
        public_id: existing_view[:public_id],
        read_at: views.any? { |view| view[:read] } ? updated_at : existing_view[:read_at],
        reads_count: existing_view[:reads_count] + views.count { |view| view[:read] },
        dwell_time_total: existing_view[:dwell_time_total] + views.sum { |view| view[:dwell_time] || 0 },
        updated_at: views.pluck(:updated_at).compact.max || now,
      }
    end

    upsert_data = upsert_data.compact

    return if upsert_data.empty?

    PostView.upsert_all(upsert_data)

    post_ids = posts.values.map(&:id)
    PostView.counter_culture_fix_counts(only: :post, where: { posts: { id: post_ids } })
  end
end
