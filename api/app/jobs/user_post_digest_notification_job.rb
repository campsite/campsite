# frozen_string_literal: true

class UserPostDigestNotificationJob < BaseJob
  sidekiq_options queue: "within_30_minutes"

  def perform(id)
    notification = ScheduledNotification.includes(schedulable: :organizations).find_by(id: id)
    return unless notification

    user = notification.schedulable
    return unless user.is_a?(User)

    memberships = user.kept_organization_memberships.includes(:organization)
    memberships.find_each do |membership|
      # avoid race conditions where membership is destroyed
      next unless membership.organization

      is_weekly_digest = notification.weekly_digest?

      if is_weekly_digest
        send_weekly_digest(membership)
      else
        send_daily_digest(membership)
      end
    end
  end

  private

  def base_scope(member)
    scope = member.organization.kept_published_posts.with_active_project.eager_load(:links, :attachments, :project, member: :user)
    scope.with_project_membership_for(member.user).or(scope.with_subscription_for(member.user))
  end

  def send_weekly_digest(member)
    time_frame = 1.week.ago

    scope = base_scope(member).where("posts.created_at >= ?", time_frame).order(created_at: :desc)
    posts = Pundit.policy_scope!(member.user, scope)
      .leaves
      .eager_load(:links, :attachments, :project, member: :user)
      # force fetching immediately so it will be serialized in the mailer
      .to_a

    projects = Pundit.policy_scope!(member.user, member.organization.projects)
      .includes(:creator)
      .where("projects.created_at >= ?", time_frame)
      .where(archived_at: nil)
      .order(created_at: :desc)
      # force fetching immediately so it will be serialized in the mailer
      .to_a

    return if posts.none? && projects.none?

    OrganizationMailer.weekly_digest(member, posts, projects).deliver_later
  end

  def send_daily_digest(member)
    time_frame = 1.day.ago

    seen_post_ids = PostView.where(member: member)
      .where("created_at >= ?", time_frame)
      .pluck(:post_id)

    scope = base_scope(member).where("posts.created_at >= ?", time_frame)
      # do not include posts the user has already seen
      .where.not(id: seen_post_ids)
      # do not include the user's own posts
      .where.not(member: member)
      .order(created_at: :desc)
    posts = Pundit.policy_scope!(member.user, scope)
      # force fetching immediately so it will be serialized in the mailer
      .to_a

    return if posts.none?

    OrganizationMailer.daily_digest(member, posts).deliver_later
  end
end
