# frozen_string_literal: true

class MessageThread < ApplicationRecord
  include Discard::Model
  include PublicIdGenerator
  include ImgixUrlBuilder
  include Eventable
  include Favoritable

  belongs_to :owner, polymorphic: true
  delegate :organization, to: :owner
  delegate :slug, to: :organization, prefix: true
  delegate :url, to: :call_room, allow_nil: true, prefix: true

  attr_accessor :event_actor

  has_many :memberships, class_name: "MessageThreadMembership", dependent: :destroy_async
  has_many :organization_memberships, through: :memberships
  has_many :kept_organization_memberships, -> { kept }, through: :memberships, source: :organization_membership
  has_many :users, through: :organization_memberships
  has_many :messages, dependent: :destroy_async
  has_many :membership_updates, class_name: "MessageThreadMembershipUpdate", dependent: :destroy_async
  has_many :oauth_applications, through: :memberships, source: :oauth_application
  has_one :call_room, as: :subject, dependent: :destroy_async
  has_many :calls, through: :call_room
  has_one :active_call, -> { active }, class_name: "Call", through: :call_room, source: :calls
  has_one :project
  belongs_to :latest_message, class_name: "Message", optional: true

  validate :enforce_no_duplicate_dms, on: :create

  validates :title, length: { maximum: 80, too_long: "must be less than 80 characters", allow_blank: true }

  after_destroy_commit -> { trigger_thread_destroyed_event }

  SERIALIZER_INCLUDES = [
    :call_room,
    :project,
    :oauth_applications,
    active_call: Call::SERIALIZER_EAGER_LOAD,
    latest_message: [sender: OrganizationMembership::SERIALIZER_EAGER_LOAD],
    organization_memberships: OrganizationMembership::SERIALIZER_EAGER_LOAD,
  ].freeze
  scope :serializer_includes, -> {
    eager_load(*SERIALIZER_INCLUDES).preload(owner: :organization)
  }

  scope :non_project, -> {
    where(
      <<~SQL.squish,
        NOT EXISTS (
          SELECT 1 FROM projects WHERE projects.message_thread_id = message_threads.id LIMIT 1
        )
      SQL
    )
  }

  scope :with_member_public_ids, ->(member_public_ids) do
    double_not = <<~SQL.squish
      NOT EXISTS (
        SELECT * FROM organization_memberships WHERE NOT EXISTS (
          SELECT * FROM message_thread_memberships
          WHERE message_thread_memberships.organization_membership_id = organization_memberships.id
            AND message_thread_memberships.message_thread_id = message_threads.id
        )
        AND organization_memberships.public_id IN (?)
      )
    SQL

    where(double_not, member_public_ids)
  end

  def channel_name
    "private-thread-#{public_id}"
  end

  def member?(user)
    organization_memberships.exists?(user: user)
  end

  def mark_read(member)
    memberships.where(organization_membership: member).update_all(last_read_at: Time.current)
    PusherTriggerJob.perform_async(member.user.channel_name, "thread-marked-read", public_id.to_json)
  end

  def mark_unread(member)
    memberships.where(organization_membership: member).update_all(
      last_read_at: latest_message ? latest_message.created_at - 1 : nil,
      manually_marked_unread_at: Time.current,
    )
    PusherTriggerJob.perform_async(member.user.channel_name, "thread-marked-unread", public_id.to_json)
  end

  def send_message!(
    sender: nil,
    content:,
    attachments: [],
    reply_to: nil,
    call: nil,
    integration: nil,
    oauth_application: nil,
    system_shared_post: nil
  )
    reply_to = messages.find_by!(public_id: reply_to) if reply_to.present?

    message = messages.create!(
      sender: sender,
      content: content,
      reply_to: reply_to,
      call: call,
      attachments_attributes: attachments,
      integration: integration,
      oauth_application: oauth_application,
      system_shared_post: system_shared_post,
    )

    # Set latest_message so we don't reload it during request, persist latest_message_id for future requests without triggering callbacks/validations in `update_columns`.
    self.latest_message = message
    update_columns(last_message_at: Time.current, latest_message_id: message.id)
    mark_read(sender) if sender

    notify_mentioned_apps(message)

    InvalidateMessageJob.perform_async(sender&.id, message.id, "new-message")

    if integration_dm?
      WebhookEvents::MessageDm.new(message: message).call
    else
      WebhookEvents::MessageCreated.new(message: message).call
    end

    message
  end

  def update_message!(actor:, message:, content:)
    raise ActiveRecord::RecordNotFound unless message.message_thread_id == id

    message.content = content
    message.save!(touch: message.content_changed?)

    InvalidateMessageJob.perform_async(actor.id, message.id, "update-message")
  end

  def discard_message!(actor:, message:)
    raise ActiveRecord::RecordNotFound unless message.message_thread_id == id

    message.discard!

    InvalidateMessageJob.perform_async(actor.id, message.id, "discard-message")
  end

  def update_latest_message!
    latest_message = messages.kept.order(created_at: :desc).first
    update_columns(last_message_at: latest_message&.created_at, latest_message_id: latest_message&.id)
  end

  def leave!(member)
    transaction do
      memberships.find_by!(organization_membership: member).destroy!
      membership_updates.create!(actor: member, removed_organization_membership_ids: [member.id])
      favorites.find_by(organization_membership: member)&.destroy!
    end
  end

  def update_notification_level!(member, level)
    memberships.find_by!(organization_membership: member).update!(notification_level: level)
  end

  def trigger_incoming_call_prompt(caller_organization_membership:)
    return if group? || !caller_organization_membership

    call_room.invitations.create!(
      creator_organization_membership: caller_organization_membership,
      invitee_organization_membership_ids: other_members(caller_organization_membership).pluck(:id),
    ).notify_invitees
  end

  def update_other_organization_memberships!(other_organization_memberships:, actor:)
    transaction do
      previous_organization_membership_ids = organization_memberships.pluck(:id)
      update!(organization_memberships: (other_organization_memberships + [actor]).uniq, event_actor: actor)
      organization_membership_ids = organization_memberships.pluck(:id)
      membership_updates.create!(
        actor: actor,
        added_organization_membership_ids: organization_membership_ids - previous_organization_membership_ids,
        removed_organization_membership_ids: previous_organization_membership_ids - organization_membership_ids,
      )
    end
  end

  def add_oauth_application!(oauth_application:, actor:)
    transaction do
      membership = memberships.find_or_create_by!(oauth_application: oauth_application)
      membership_updates.create!(
        actor: actor,
        added_oauth_application_ids: [oauth_application.id],
      )
      membership
    end
  end

  def remove_oauth_application!(oauth_application:, actor:)
    transaction do
      memberships.find_by!(oauth_application: oauth_application).destroy!
      membership_updates.create!(
        actor: actor,
        removed_oauth_application_ids: [oauth_application.id],
      )
    end
  end

  def latest_message_truncated(viewer: nil)
    latest_message&.preview_truncated(thread: self, viewer: viewer)
  end

  def other_members(member)
    return organization_memberships unless member

    organization_memberships.reject { |m| m.id == member.id || m.discarded? }
  end

  def viewer_is_thread_member?(member)
    organization_memberships.pluck(:id).include?(member.id)
  end

  def integration_dm?
    !group? && organization_memberships.size == 1 && oauth_applications.size == 1
  end

  def deactivated_members
    organization_memberships.select { |m| m.discarded? }
  end

  def formatted_title(member = nil)
    other_members = self.other_members(member)
    if title.present?
      title
    elsif integration_dm?
      oauth_applications.first.name
    elsif other_members.empty?
      # DM titles should use the name of the deactivated member
      deactivated_members.size == 1 ? deactivated_members[0].user.display_name : "Just you"
    elsif other_members.length == 1
      other_members[0].user.display_name
    elsif other_members.length == 2
      other_members.map { |m| m.user.display_name }.join(" and ")
    else
      "#{other_members.first.user.display_name} and #{other_members.length - 1} others"
    end
  end

  def default_call_title(member = nil)
    return title if title.present?
    return formatted_title if !member || organization_memberships.exclude?(member)

    other_members = self.other_members(member)

    if other_members.empty?
      "Just you"
    elsif other_members.length == 1
      "#{other_members[0].user.display_name} and #{member.user.display_name}"
    else
      "#{other_members.first.user.display_name} and #{other_members.length} others"
    end
  end

  def self.unread_counts_async(thread_ids, member)
    if thread_ids.empty?
      return AsyncPreloader.value({})
    end

    scope = MessageThreadMembership
      .unread
      .group(:message_thread_id)
      .where(
        message_thread_id: thread_ids, organization_membership: member,
      )
      .async_count

    AsyncPreloader.new(scope) do |counts|
      thread_ids.index_with { |thread_id| counts[thread_id] || 0 }.to_h
    end
  end

  def self.manually_marked_unread_async(thread_ids, member)
    if thread_ids.empty?
      return AsyncPreloader.value({})
    end

    scope = MessageThreadMembership
      .manually_marked_unread
      .where(
        message_thread_id: thread_ids, organization_membership: member,
      )
      .async_pluck(:message_thread_id)

    AsyncPreloader.new(scope) do |scope|
      thread_ids.index_with { |thread_id| scope.include?(thread_id) }.to_h
    end
  end

  def image_path
    return oauth_applications.first.avatar_path if integration_dm?

    super
  end

  def image_url
    return unless image_path

    build_imgix_url(image_path)
  end

  def avatar_url(size: nil)
    return if image_path.blank?

    # retina scale images
    size = size.nil? ? nil : size * 2

    uri = Addressable::URI.parse(image_path)
    return uri.to_s if uri.absolute? # return if absolute url eg. avatar from omniauth user

    build_imgix_url(image_path, {
      "w": size,
      "h": size,
      "fit": "crop",
    })
  end

  def avatar_urls
    return if image_path.blank?

    {
      xs: avatar_url(size: 20),
      sm: avatar_url(size: 24),
      base: avatar_url(size: 32),
      lg: avatar_url(size: 40),
      xl: avatar_url(size: 64),
      xxl: avatar_url(size: 112),
    }
  end

  def path
    project&.path(organization) || "#{organization.path}/chat/#{public_id}"
  end

  def url
    Campsite.app_url(path: path)
  end

  def event_organization
    event_actor&.organization || organization
  end

  def create_hms_call_room!
    # TODO: remove once call rooms can be owned by integrations
    return unless owner_type == "OrganizationMembership"

    create_call_room!(
      organization: organization,
      remote_room_id: hms_client.create_room.id,
      creator: owner,
      source: :subject,
    )
  end

  def remote_call_room_id
    call_room&.remote_room_id
  end

  def favoritable_name(member = nil)
    formatted_title(member)
  end

  def trigger_thread_destroyed_event
    kept_organization_memberships.each do |organization_membership|
      PusherTriggerJob.perform_async(
        organization_membership.user.channel_name,
        "thread-destroyed",
        {
          message_thread_id: public_id,
          organization_slug: organization_slug,
        }.to_json,
      )
    end
  end

  def viewer_can_force_notification?(viewer)
    return false if !viewer_is_thread_member?(viewer) || group? || latest_message&.sender != viewer

    other_user = other_members(viewer).first&.user
    return false if !other_user || !other_user.notifications_paused? || !other_user.notifications_paused_at

    other_user.notifications_paused_at.before?(latest_message.created_at) &&
      (!notification_forced_at || notification_forced_at.before?(latest_message.created_at))
  end

  def force_notification!(organization_membership:)
    update!(notification_forced_at: Time.current)
    InvalidateMessageJob.perform_async(organization_membership.id, latest_message.id, "force-message-notification")
  end

  private

  def hms_client
    @hms_client ||= HmsClient.new(app_access_key: Rails.application.credentials.hms.app_access_key, app_secret: Rails.application.credentials.hms.app_secret)
  end

  def enforce_no_duplicate_dms
    return if group? || organization_memberships.length > 2

    if integration_dm?
      existing_thread = organization_memberships.first.message_threads
        .joins(:oauth_applications)
        .exists?(group: false, oauth_applications: oauth_applications.first)

      if existing_thread
        errors.add(:base, "You already have a chat with this integration")
      end
    elsif organization_memberships.length == 2
      existing_thread = organization_memberships.first.message_threads
        .joins(:organization_memberships)
        .exists?(group: false, organization_memberships: organization_memberships.second)

      if existing_thread
        errors.add(:base, "You already have a chat with this user")
      end
    end
  end

  def notify_mentioned_apps(message)
    message.mentioned_apps.each do |app|
      if oauth_applications.include?(app)
        WebhookEvents::AppMentioned.new(subject: message, oauth_application: app).call
      else
        send_message!(sender: nil, content: "#{app.name} could not see this message because it is not a member of this thread. <a href='#manage-integrations' class='text-blue-500'>Manage integrations</a>")
      end
    end
  end
end
