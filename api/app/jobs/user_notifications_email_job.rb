# frozen_string_literal: true

class UserNotificationsEmailJob < BaseJob
  sidekiq_options queue: "background"

  BUNDLE_DURATION = 15.minutes

  def perform(user_id)
    # bail if user was deleted
    return unless (user = User.find_by(id: user_id))

    unread_notifications_by_org =
      if user.email_notifications_enabled?
        user
          .unread_email_notifications
          .since(user.scheduled_email_notifications_from || BUNDLE_DURATION.ago)
          .includes(:event)
          .where(event: { subject_type: [Post, Comment, PostFeedbackRequest, Permission, ProjectMembership, Project, FollowUp, Call] })
          .joins(:organization)
          .group_by(&:organization)
      else
        {}
      end

    unread_message_notifications_by_org =
      if user.message_email_notifications_enabled?
        user
          .unread_message_notifications
          .since(user.scheduled_email_notifications_from || BUNDLE_DURATION.ago)
          .order(created_at: :desc)
          .group_by(&:organization)
      else
        {}
      end

    return if unread_notifications_by_org.none? && unread_message_notifications_by_org.none?

    organizations = (unread_notifications_by_org.keys + unread_message_notifications_by_org.keys).uniq

    organizations.each do |org|
      OrganizationMailer.bundled_notifications(user, org, unread_notifications_by_org[org] || [], unread_message_notifications_by_org[org] || []).deliver_later
    end
  end
end
