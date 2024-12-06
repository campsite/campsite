# frozen_string_literal: true

class Project < ApplicationRecord
  class NoAddableMembersError < StandardError; end

  include PublicIdGenerator
  include ImgixUrlBuilder
  include Favoritable
  include Eventable
  include ActionView::Helpers::UrlHelper
  include Tokenable

  ORG_DEFAULT_PROJECTS = [
    {
      name: "General",
      description: "Share updates, work-in-progress, and team announcements.",
      cover_photo_path: "#{Rails.application.credentials.imgix.url}/project-covers/project-cover-9.png",
      is_general: true,
      is_default: true,
    },
  ].freeze

  MEMBERS_LIMIT = 2
  CAMPSITE_INSIDERS_PROD_PUBLIC_ID = "potztg2sr8pv"
  PUBLIC_API_ALLOWED_ORDER_FIELDS = [:name, :last_activity_at, :created_at]

  belongs_to :organization
  belongs_to :creator, class_name: "OrganizationMembership"
  belongs_to :archived_by, class_name: "OrganizationMembership", optional: true
  belongs_to :slack_channel, class_name: "IntegrationChannel", primary_key: :provider_channel_id, optional: true
  belongs_to :message_thread, optional: true

  has_many :bookmarks, -> { order(position: :asc) }, as: :bookmarkable, dependent: :destroy
  has_many :subscriptions, class_name: "UserSubscription", as: :subscribable
  has_many :subscribers, through: :subscriptions, source: :user
  has_many :posts, dependent: :destroy_async
  has_many :kept_published_posts, -> { kept.with_published_state }, class_name: "Post"
  has_one :most_recent_kept_published_post, -> { kept.with_published_state.order(created_at: :desc) }, class_name: "Post"
  has_many :contributors, -> { distinct }, through: :kept_published_posts, source: :member
  has_many :organization_invitation_projects, dependent: :destroy_async
  has_many :project_memberships, dependent: :destroy_async
  has_many :kept_project_memberships, -> { kept }, class_name: "ProjectMembership"
  has_many :members, through: :kept_project_memberships, source: :organization_membership
  has_many :member_users, through: :kept_project_memberships, source: :user
  has_many :views, class_name: "ProjectView", dependent: :destroy_async
  has_many :oauth_applications, through: :project_memberships, source: :oauth_application
  has_many :kept_oauth_applications, through: :kept_project_memberships, source: :oauth_application
  has_many :notes, dependent: :nullify
  has_many :kept_notes, -> { kept }, class_name: "Note"
  has_many :pins, class_name: "ProjectPin", dependent: :destroy_async
  has_many :kept_pins, -> { kept }, class_name: "ProjectPin"
  has_many :calls, dependent: :nullify
  has_many :completed_recorded_calls, -> { completed.recorded }, class_name: "Call"
  has_one :call_room, as: :subject, dependent: :destroy_async
  has_many :display_preferences, class_name: "ProjectDisplayPreference", dependent: :destroy_async

  accepts_nested_attributes_for :bookmarks

  before_create :set_last_activity_at
  after_commit :reindex_posts, if: -> { Searchkick.callbacks? && saved_change_to_name? }, on: [:update]
  before_validation :set_tokenable

  scope :not_private, -> { where(private: false) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :not_archived, -> { where(archived_at: nil) }
  scope :viewable_by, ->(user) { not_private.with_view_all_permission_for(user).or(with_project_membership_for(user)) }
  scope :viewable_by_api_actor, ->(api_actor) { not_private.where(organization: api_actor.organization).or(with_project_membership_for_application(api_actor.application)) }
  scope :with_view_all_permission_for, ->(user, projects_table_alias: :projects) {
    exists =
      <<~SQL.squish
        EXISTS(
          SELECT 1 FROM organization_memberships
          WHERE organization_memberships.user_id = ?
            AND organization_memberships.organization_id = #{projects_table_alias}.organization_id
            AND organization_memberships.discarded_at IS NULL
            AND organization_memberships.role_name in (?)
          LIMIT 1
        )
      SQL

    where(exists, user.id, Role.with_permission(resource: Role::PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION).map(&:name))
  }
  scope :with_project_membership_for, ->(user, projects_table_alias: :projects) {
    where(
      "EXISTS (:project_memberships)",
      project_memberships: ProjectMembership.select(1).kept.joins(:user)
        .where(users: { id: user.id })
        .merge(OrganizationMembership.kept)
        .where(ProjectMembership.arel_table[:project_id].eq(Project.arel_table.alias(projects_table_alias)[:id])),
    )
  }
  scope :with_project_membership_for_application, ->(application, projects_table_alias: :projects) {
    where(
      "EXISTS (:project_memberships)",
      project_memberships: ProjectMembership.select(1).kept.joins(:oauth_application)
        .where(oauth_applications: { id: application.id })
        .merge(OauthApplication.kept)
        .where(ProjectMembership.arel_table[:project_id].eq(Project.arel_table.alias(projects_table_alias)[:id])),
    )
  }

  SERIALIZER_INCLUDES = [:organization, :slack_channel, :message_thread, call_room: :organization]
  scope :serializer_includes, -> do
    eager_load(SERIALIZER_INCLUDES)
  end

  scope :search_by, ->(query_string) do
    where("projects.name LIKE ?", "%#{query_string}%")
  end

  validates :name,
    length: {
      maximum: 32,
      too_long: "should be less than 32 characters.",
    },
    presence: true

  validates :description,
    length: {
      maximum: 280,
      too_long: "should be less than 280 characters.",
    }

  validate :cant_be_private_if_general_or_default

  validates :invite_token, presence: true, uniqueness: true
  encrypts :invite_token, deterministic: true

  delegate :slack_token, to: :organization
  delegate :mrkdwn_link, to: SlackBlockKit
  delegate :url, to: :call_room, allow_nil: true, prefix: true

  attr_accessor :event_actor

  def api_type_name
    "Project"
  end

  def favorited?(org_member)
    favorites.exists?(organization_membership: org_member)
  end

  def self.viewer_recent_posts_count_async(project_ids, organization_membership)
    return AsyncPreloader.value({}) unless organization_membership

    scope = Post.where(
      project_id: project_ids,
      member: organization_membership,
      discarded_at: nil,
      created_at: 1.month.ago..Time.current,
    )
      .select(:project_id, "SUM(EXP(-DATEDIFF(NOW(), posts.created_at)/30)) AS _score")
      .group(:project_id)
      .load_async

    AsyncPreloader.new(scope) { |scope| scope.index_by(&:project_id).transform_values { |post| post["_score"].to_f } }
  end

  def archived?
    archived_at.present?
  end

  def path(organization = nil)
    (organization || self.organization).path + "/projects/#{public_id}"
  end

  # provide a known org to prevent N+1s
  def url(organization = nil)
    Campsite.app_url(path: path)
  end

  def update_slack_channel!(id:, is_private:)
    return if slack_channel_id == id

    self.slack_channel_id = id

    return unless slack_token
    return unless id
    return if is_private

    slack_client.conversations_join(channel: id)
  end

  def cover_photo_url
    return if cover_photo_path.blank?

    uri = Addressable::URI.parse(cover_photo_path)
    return uri.to_s if uri.absolute?

    build_imgix_url(cover_photo_path)
  end

  def archive!(org_member)
    update!(archived_at: Time.current, archived_by: org_member, event_actor: org_member)
  end

  def unarchive!
    update!(archived_at: nil, archived_by: nil)
  end

  def build_slack_blocks
    BuildSlackBlocks.new(project: self).run
  end

  def self.viewer_subscription_async(project_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = UserSubscription.where(subscribable_type: Project.to_s)
      .where(subscribable_id: project_ids)
      .where(user_id: membership.user_id)
      .group(:subscribable_id)
      .load_async

    AsyncPreloader.new(scope) { scope.index_by(&:subscribable_id) }
  end

  def self.viewer_is_member_async(project_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = ProjectMembership
      .where(project_id: project_ids, organization_membership_id: membership.id, discarded_at: nil)
      .group(:project_id)
      .async_count

    AsyncPreloader.new(scope) { |scope| scope.transform_values { |count| count > 0 } }
  end

  def self.unread_for_viewer_async(project_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = Project
      .left_outer_joins(:views, :kept_published_posts, message_thread: :memberships)
      .where(id: project_ids)

    scope = scope
      # Has manually marked unread views
      .where(views: { organization_membership: membership })
      .where.not(views: { manually_marked_unread_at: nil })
      .or(
        # Has unread posts
        scope.where(views: { organization_membership: membership })
          .where.not("posts.organization_membership_id <=> ?", membership.id)
          .where("posts.created_at > views.last_viewed_at")
          .where(
            <<~SQL.squish, membership.id
              NOT EXISTS (
                SELECT 1 FROM post_views WHERE post_views.post_id = posts.id AND post_views.organization_membership_id = ?
              )
            SQL
          ),
      ).or(
        # Has unread messages
        scope.merge(
          MessageThreadMembership
            .unread(message_thread_memberships_table_alias: :memberships)
            .where(memberships: { organization_membership_id: membership.id }),
        ),
      )
      .group(:id)
      .async_count

    AsyncPreloader.new(scope) { |scope| scope.transform_values { |count| count > 0 } }
  end

  def self.display_preferences_async(project_ids, membership)
    return AsyncPreloader.value({}) unless membership

    scope = ProjectDisplayPreference
      .where(project_id: project_ids, organization_membership_id: membership.id)
      .load_async

    AsyncPreloader.new(scope) { |scope| scope.index_by(&:project_id) }
  end

  def favoritable_name(member = nil)
    name
  end

  def favoritable_accessory
    accessory
  end

  def favoritable_private
    private?
  end

  def add_member!(organization_membership, skip_notifications: false, event_actor: Current.organization_membership)
    project_membership = project_memberships.find_or_initialize_by(organization_membership: organization_membership)
    project_membership.event_actor = event_actor
    project_membership.skip_notifications = skip_notifications
    if project_membership.discarded?
      project_membership.undiscard!
    else
      project_membership.save!
    end

    message_thread&.memberships&.create_or_find_by!(organization_membership: organization_membership)

    subscriptions.create_or_find_by!(user: organization_membership.user) unless public_id == CAMPSITE_INSIDERS_PROD_PUBLIC_ID

    project_membership
  end

  def add_oauth_application!(oauth_application, skip_notifications: false, event_actor: Current.organization_membership)
    project_membership = project_memberships.find_or_initialize_by(oauth_application: oauth_application)
    project_membership.event_actor = event_actor
    project_membership.skip_notifications = skip_notifications
    if project_membership.discarded?
      project_membership.undiscard!
    else
      project_membership.save!
    end

    message_thread&.add_oauth_application!(oauth_application: oauth_application, actor: event_actor)

    project_membership
  end

  def remove_member!(organization_membership)
    Project.transaction do
      project_memberships.find_by(organization_membership: organization_membership)&.discard_by_actor(Current.organization_membership)
      subscriptions.find_by(user: organization_membership.user)&.destroy!
      favorites.find_by(organization_membership: organization_membership)&.destroy!
      message_thread&.memberships&.find_by(organization_membership: organization_membership)&.destroy!
    end
  end

  def remove_oauth_application!(oauth_application)
    project_memberships.find_by(oauth_application: oauth_application)&.discard_by_actor(Current.organization_membership)
    message_thread&.remove_oauth_application!(oauth_application: oauth_application, actor: Current.organization_membership)
  end

  def mark_read(member)
    views
      .create_or_find_by(organization_membership: member) do |view|
        view.last_viewed_at = Time.current
      end
      .update!(last_viewed_at: Time.current, manually_marked_unread_at: nil)
    PusherTriggerJob.perform_async(member.user.channel_name, "project-marked-read", public_id.to_json)
  end

  def mark_unread(member)
    views
      .find_by(organization_membership: member)
      .update!(
        manually_marked_unread_at: Time.current,
      )
    PusherTriggerJob.perform_async(member.user.channel_name, "project-marked-unread", public_id.to_json)
  end

  def event_organization
    organization
  end

  def notification_summary(notification:)
    return unless notification.subject_archived?

    actor = notification.actor.user
    display_name = private ? "🔒 #{name}" : name

    NotificationSummary.new(
      text: "#{actor.display_name} archived #{display_name}",
      blocks: [
        {
          text: { content: actor.display_name, bold: true },
        },
        {
          text: { content: " archived " },
        },
        {
          text: { content: display_name, bold: true },
        },
      ],
      slack_mrkdwn: "#{actor.display_name} archived #{mrkdwn_link(url: url, text: display_name)}",
      email: link_to(content_tag(:b, actor.display_name), "#{organization.url}/people/#{actor.username}", target: "_blank", rel: "noopener") +
      " archived " +
      link_to(content_tag(:b, display_name), url, target: "_blank", rel: "noopener"),
    )
  end

  def notification_preview_url(notification:)
    nil
  end

  def notification_body_preview(notification:)
    nil
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def notification_target_title
    name
  end

  def notification_cta_button_text
    "View channel"
  end

  def update_last_activity_at_column
    update_columns(last_activity_at: most_recent_kept_published_post&.published_at || created_at)
  end

  def invitation_url
    "#{Campsite.base_app_url}/guest/#{invite_token}"
  end

  def reset_invite_token!
    self.invite_token = generate_unique_token(attr_name: :invite_token)
    save!
  end

  def join_via_guest_link!(user)
    if (member = organization.kept_memberships.find_by(user_id: user))
      return add_member!(member)
    end

    member = organization.create_membership!(user: user, role_name: Role::GUEST_NAME, projects: [self])
    organization.admins.each { |admin| OrganizationMailer.join_via_guest_link(member, self, admin).deliver_later }
  end

  def create_hms_call_room!
    create_call_room!(
      organization: organization,
      remote_room_id: hms_client.create_room.id,
      creator: creator,
      source: :subject,
    )
  end

  def members_and_guests_count
    members_count + guests_count
  end

  def export_root_path
    "channels/#{public_id}"
  end

  def export_json
    {
      id: public_id,
      accessory: accessory,
      name: name,
      private: private?,
      archived: archived?,
      created_at: created_at,
      description: description,
      members: members.map(&:export_json),
    }
  end

  private

  def reindex_posts
    posts.reindex(mode: :async)
  end

  def slack_client
    @slack_client ||= Slack::Web::Client.new(token: slack_token)
  end

  def cant_be_private_if_general_or_default
    if private? && (is_general? || is_default?)
      errors.add(:private, "cannot be true for channels marked as general or default")
    end
  end

  def unarchiving?
    archived_at_was.present? && !archived?
  end

  def set_last_activity_at
    self.last_activity_at ||= Time.current
  end

  def tokenable_attribute
    :invite_token
  end

  def hms_client
    @hms_client ||= HmsClient.new(app_access_key: Rails.application.credentials.hms.app_access_key, app_secret: Rails.application.credentials.hms.app_secret)
  end
end
