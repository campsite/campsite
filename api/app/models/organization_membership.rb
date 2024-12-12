# frozen_string_literal: true

class OrganizationMembership < ApplicationRecord
  SlackNotificationPreferenceError = Class.new(StandardError)

  include Discard::Model
  include PublicIdGenerator

  SEEN_RECENTLY_THRESHOLD = 30.days
  PUBLIC_API_ALLOWED_ORDER_FIELDS = [:created_at, :last_seen_at]

  belongs_to :organization
  belongs_to :user
  belongs_to :latest_status, class_name: "OrganizationMembershipStatus", optional: true

  has_many :notifications
  has_many :kept_notifications, -> { kept }, class_name: "Notification"
  has_many :inbox_notifications, -> { kept.unarchived.most_recent_per_target_and_member }, class_name: "Notification"
  has_many :archived_inbox_notifications, -> { kept.archived.most_recent_per_target_and_member }, class_name: "Notification"
  has_many :kept_published_posts, -> { kept.with_published_state }, class_name: "Post"
  has_many :kept_draft_posts, -> { kept.with_draft_state }, class_name: "Post"
  has_many :preferences, as: :subject, dependent: :destroy_async
  has_many :integration_organization_memberships, dependent: :destroy_async
  has_many :post_views, dependent: :destroy_async
  has_many :reactions, dependent: :destroy_async
  has_many :member_favorites, -> { where(favoritable_type: Favorite::FAVORITABLE_TYPES.map(&:to_s)).order(position: :asc) }, class_name: "Favorite", dependent: :destroy_async
  has_many :call_peers, dependent: :destroy_async
  has_many :active_call_peers, -> { active }, class_name: "CallPeer"
  has_many :joined_calls, through: :call_peers, source: :call
  has_one :personal_call_room, class_name: "CallRoom", as: :subject, dependent: :destroy_async
  has_many :message_thread_memberships, dependent: :destroy_async
  has_many :message_threads, through: :message_thread_memberships
  has_many :non_project_message_threads, -> { non_project }, through: :message_thread_memberships, source: :message_thread
  has_many :message_thread_calls, through: :message_threads, source: :calls
  has_many :unread_message_notifications, -> { unread }, through: :message_thread_memberships, source: :message_notifications
  has_many :statuses, class_name: "OrganizationMembershipStatus", dependent: :destroy_async
  has_many :project_memberships, dependent: :destroy_async
  has_many :kept_project_memberships, -> { kept }, class_name: "ProjectMembership"
  has_many :project_views, dependent: :destroy_async
  has_many :all_projects, through: :kept_project_memberships, source: :project
  has_many :kept_projects, -> { not_archived }, through: :kept_project_memberships, source: :project
  has_many :project_calls, through: :kept_projects, source: :calls
  has_many :note_views, dependent: :destroy_async
  has_many :follow_ups, dependent: :destroy_async
  has_many :unshown_follow_ups, -> { unshown }, class_name: "FollowUp"
  has_many :notes, dependent: :destroy_async
  has_many :kept_notes, -> { kept }, class_name: "Note"
  has_many :kept_active_project_membership_notes, through: :kept_projects, source: :kept_notes
  has_many :kept_subscribed_notes, ->(organization_membership) { joins(:member).where(member: { organization_id: organization_membership.organization_id }) }, through: :user

  has_one :slack_integration_organization_membership, -> { slack }, class_name: "IntegrationOrganizationMembership"

  acts_as_list scope: :user, add_new_at: :bottom, top_of_list: 0

  validates :organization, uniqueness: { scope: :user }
  validates :role_name, inclusion: { in: Role::NAMES, list: Role::NAMES }

  delegate :email, :email_confirmed?, :subscriptions, :username, :display_name, :avatar_url, :avatar_urls, :integration?, :staff?, :trigger_current_user_stale, to: :user
  delegate :slack_client, to: :organization
  delegate :has_permission?, :counted?, to: :role, prefix: true

  after_discard :destroy_subscriptions
  after_discard :destroy_project_memberships
  after_undiscard :join_default_projects!
  after_update_commit :update_project_member_counts, if: -> { saved_change_to_role_name? }

  scope :admin, -> { where(role_name: Role::ADMIN_NAME) }
  scope :guest, -> { where(role_name: Role::GUEST_NAME) }
  scope :non_guest, -> { where.not(role_name: Role::GUEST_NAME) }
  scope :with_role_permission, ->(resource:, permission:) { where(role_name: Role.with_permission(resource: resource, permission: permission).map(&:name)) }
  scope :sharing_project_with, ->(user) { left_outer_joins(:kept_projects).where(kept_project_memberships: { project: user.kept_projects }) }
  scope :in_organization_where_guest_without_shared_project_viewable_by, ->(user) { joins(:organization).where(organization: user.view_guest_without_shared_project_organizations) }

  scope :search_by, ->(query_string) do
    joins(:user)
      .where("users.username LIKE :query OR users.name LIKE :query OR users.email LIKE :query",
        query: "%#{query_string}%")
  end

  scope :seen_recently, -> { where(last_seen_at: SEEN_RECENTLY_THRESHOLD.ago..) }
  scope :role_counted, -> { where(role_name: Role.counted.map(&:name)) }

  SERIALIZER_EAGER_LOAD = [:user, :latest_status]
  scope :serializer_eager_load, -> { eager_load(*SERIALIZER_EAGER_LOAD) }

  counter_culture :organization,
    column_name: proc { |membership| !membership.staff? && membership.kept? && membership.role_counted? ? :member_count : nil },
    column_names: -> { { OrganizationMembership.joins(:user).merge(User.not_staff).kept.role_counted => :member_count } }

  def seen_recently?
    last_seen_at.present? && last_seen_at > SEEN_RECENTLY_THRESHOLD.ago
  end

  def can_modify?
    admin?
  end

  def admin?
    role == Role.by_name!(Role::ADMIN_NAME)
  end

  def member?
    role == Role.by_name!(Role::MEMBER_NAME)
  end

  def viewer?
    role == Role.by_name!(Role::VIEWER_NAME)
  end

  def guest?
    role == Role.by_name!(Role::GUEST_NAME)
  end

  def application?
    false
  end

  def role
    Role.by_name!(role_name)
  end

  def mention_role_name
    "member"
  end

  def projects
    user.projects.where(organization: organization)
  end

  def favorite_default_projects!
    default_projects = organization.projects.where(is_default: true).not_archived
    default_projects.each do |project|
      next if project.private?

      member_favorites.create(favoritable: project)
    end
  end

  def join_default_projects!
    default_projects = organization.projects.where(is_default: true).not_archived
    default_projects.each do |project|
      next if project.private?

      project.add_member!(self, skip_notifications: true)
    end
  end

  def sharing_project_with?(other_organization_membership)
    kept_projects.intersect?(other_organization_membership.kept_projects)
  end

  def can_view_guest_without_shared_project?
    role_has_permission?(resource: Role::GUEST_WITHOUT_SHARED_PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION)
  end

  def api_type_name
    "OrganizationMember"
  end

  def update_role(current_user:, role_name:)
    only_admin = admin? && organization.admins.length == 1

    if role_name != Role::ADMIN_NAME && only_admin && current_user == user
      errors.add(:role, "cannot be updated to a member.")
    else
      update(role_name: role_name)
    end

    self
  end

  def url
    organization.url + "/people/#{user.username}"
  end

  def userlist_properties
    { role: role_name }
  end

  def deactivated?
    discarded?
  end

  def destroy_subscriptions
    organization.post_subscriptions.where(user: user).delete_all
  end

  def find_or_initialize_preference(key)
    preferences.find_or_initialize_by(key: key)
  end

  def slack_user_id
    slack_integration_organization_membership
      &.data
      &.find_by(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID)
      &.value
  end

  def linked_to_slack?
    slack_user_id.present?
  end

  def slack_notifications_enabled?
    preference = preferences.find_by(key: Preference::SLACK_NOTIFICATIONS)
    return false unless preference

    preference.value == "enabled"
  end

  def enable_slack_notifications!
    raise SlackNotificationPreferenceError, "Slack notifications already enabled" if slack_notifications_enabled?

    SlackConnectedConfirmationJob.perform_async(slack_integration_organization_membership.id)
    find_or_initialize_preference(Preference::SLACK_NOTIFICATIONS).update!(value: "enabled")
  end

  def disable_slack_notifications!
    raise SlackNotificationPreferenceError, "Slack notifications not enabled" unless slack_notifications_enabled?

    find_or_initialize_preference(Preference::SLACK_NOTIFICATIONS).update!(value: "disabled")
  end

  def welcomed_to_slack?
    !!slack_integration_organization_membership
      &.data
      &.find_by(name: IntegrationOrganizationMembershipData::WELCOMED_AT)
      &.value
      &.present?
  end

  def welcomed_to_slack!
    slack_integration_organization_membership
      &.data
      &.find_or_initialize_by(name: IntegrationOrganizationMembershipData::WELCOMED_AT)
      &.update!(value: Time.current.iso8601)
  end

  def latest_active_status
    latest_status if latest_status&.active?
  end

  def destroy_project_memberships
    kept_project_memberships.each do |project_membership|
      project_membership.project.remove_member!(self)
    end
  end

  def self.reorder(public_ids:, user:)
    memberships = user.organization_memberships.where(public_id: public_ids).index_by(&:public_id)
    raise ActiveRecord::RecordNotFound, "Membership not found" if public_ids.size != memberships&.values&.size

    ActiveRecord::Base.transaction do
      public_ids.each_with_index do |public_id, index|
        membership = memberships[public_id]
        membership.set_list_position(index)
      end
    end
  end

  def calls
    Call.where(id: joined_calls.select(:id))
      .or(Call.where(id: message_thread_calls.select(:id)))
      .or(Call.where(id: project_calls.select(:id)))
  end

  def on_call?
    active_call_peers.any?
  end

  def update_project_member_counts
    ProjectMembership.counter_culture_fix_counts(only: :project, where: { id: kept_projects.pluck(:id) })
  end

  def export_json
    {
      id: public_id,
      username: user.username,
      display_name: user.name,
      email: user.email,
      created_at: created_at,
      role: role_name,
      deactivated: discarded?,
    }
  end
end
