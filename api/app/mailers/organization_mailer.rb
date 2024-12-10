# frozen_string_literal: true

class OrganizationMailer < ApplicationMailer
  self.mailer_name = "mailers/organization"

  before_deliver :skip_demo_orgs

  def invite_member(invitation)
    @invitation     = invitation
    @sender         = invitation.sender
    @organization   = invitation.organization
    @invitation_url = invitation.invitation_url
    @title          = "#{@sender.display_name} invited you to #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: @invitation.email, tag: "organization-invite-member")
  end

  def member_removed(user, organization)
    @organization = organization
    @user = user
    @title = "You were removed as a member from #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: @user.email, tag: "organization-member-removed")
  end

  def membership_request(request, admin)
    @organization = request.organization
    @user = request.user
    @title = "#{@user.display_name} requested to join #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: admin.email, tag: "organization-membership-request")
  end

  def join_via_link(member, admin)
    @organization = member.organization
    @user = member.user
    @title = "#{@user.display_name} joined #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: admin.email, tag: "organization-membership-joined-link")
  end

  def join_via_verified_domain(member, admin)
    @organization = member.organization
    @user = member.user
    @title = "#{@user.display_name} joined #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: admin.email, tag: "organization-membership-joined-verified-domain")
  end

  def join_via_guest_link(member, project, admin)
    @organization = member.organization
    @project = project
    @user = member.user
    @title = "#{@user.display_name} joined #{@organization.name} on Campsite"

    campfire_mail(subject: @title, to: admin.email, tag: "organization-membership-joined-guest-link")
  end

  def daily_digest(member, posts)
    @posts = posts
    @organization = member.organization
    @title = "🏕️ #{@posts.size} #{"post".pluralize(@posts.size)} you may have missed"

    if member.user.kept_organization_memberships.size > 1
      @title += " in #{member.organization.name}"
    end

    setup_posters_and_byline(posts)

    campfire_mail(subject: @title, to: member.user.email, tag: "user-digest-daily")
  end

  def weekly_digest(member, posts, projects)
    @posts = posts
    @projects = projects
    @organization = member.organization
    @title = "🏕️ #{member.organization.name} Weekly Summary"

    setup_posters_and_byline(posts)

    campfire_mail(subject: @title, to: member.user.email, tag: "user-digest-weekly")
  end

  def bundled_notifications(user, organization, notifications, message_notifications)
    @user = user
    @organization = organization
    @organization_membership = OrganizationMembership.find_by(user: user, organization: organization)
    @notifications = notifications
    @message_notifications = message_notifications

    @title = if notifications.one? && message_notifications.none?
      "🏕️ #{notifications.first.summary.text}"
    elsif notifications.none? && message_notifications.one?
      thread = message_notifications.first.message_thread
      "🏕️ Unread messages from #{thread.formatted_title(@organization_membership)}"
    elsif notifications.any? && message_notifications.none?
      "🏕️ #{notifications.size} unread #{"notification".pluralize(notifications.size)} in #{organization.name}"
    elsif notifications.none? && message_notifications.any?
      "🏕️ Unread messages in #{organization.name}"
    else
      "🏕️ Unread notifications and messages in #{organization.name}"
    end

    campfire_mail(subject: @title, to: user.email, tag: "user-bundled-notifications")
  end

  def data_export_completed(data_export)
    @data_export = data_export
    @user = data_export.member.user
    @title = "Your data export is ready"

    campfire_mail(subject: @title, to: @user.email, tag: "data-export-finished")
  end

  private

  def skip_demo_orgs
    throw(:abort) if @organization&.demo? && !Rails.env.development?
  end

  def setup_posters_and_byline(posts)
    @posters = posts.map(&:author).uniq

    posters_count = @posters.size
    append_posters = @posters.first(3).map(&:display_name)
    diff = posters_count - append_posters.size
    append_posters << if diff == 1
      @posters.last.display_name
    elsif diff > 1
      "#{diff} #{"other".pluralize(diff)}"
    end
    append_posters = append_posters.compact.to_sentence(last_word_connector: ", and ")

    @post_count_byline = "#{posts.size} #{"post".pluralize(posts.size)} by #{append_posters}"
  end
end
