# frozen_string_literal: true

class OrganizationMailerPreview < ActionMailer::Preview
  def invite_member
    invitation = OrganizationInvitation.first
    OrganizationMailer.invite_member(invitation)
  end

  def member_removed
    user = User.first
    organization = Organization.first

    OrganizationMailer.member_removed(user, organization)
  end

  def membership_request
    admin = User.first
    request = OrganizationMembershipRequest.first

    OrganizationMailer.membership_request(request, admin)
  end

  def join_via_link
    admin = User.first
    member = OrganizationMembership.first

    OrganizationMailer.join_via_link(member, admin)
  end

  def join_via_verified_domain
    admin = User.first
    member = OrganizationMembership.first

    OrganizationMailer.join_via_verified_domain(member, admin)
  end

  def daily_digest
    member = OrganizationMembership.first
    posts = Post.all.order(created_at: :desc).first(10)

    OrganizationMailer.daily_digest(member, posts)
  end

  def daily_digest_one_post
    member = OrganizationMembership.first
    posts = Post.all.take(1)

    OrganizationMailer.daily_digest(member, posts)
  end

  def weekly_digest
    member = OrganizationMembership.first
    posts = Post.all.take(10)
    projects = Project.all.take(4)

    OrganizationMailer.weekly_digest(member, posts, projects)
  end

  def bundled_notifications
    member = OrganizationMembership.first

    notifications = member.notifications.most_recent_per_target_and_member.order(created_at: :desc)
    message_notifications = member.unread_message_notifications.order(created_at: :desc)

    # filter for unique target + reasons
    target_reasons = []
    notifications = notifications.select do |notification|
      target_reason = [notification.event.subject_type, notification.reason].join("-")
      if target_reasons.include?(target_reason)
        false
      else
        target_reasons << target_reason
        true
      end
    end

    OrganizationMailer.bundled_notifications(member.user, member.organization, notifications, message_notifications)
  end
end
