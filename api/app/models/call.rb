# frozen_string_literal: true

class Call < ApplicationRecord
  include PublicIdGenerator
  include SearchConfigBuilder
  include Pinnable
  include Favoritable
  include FollowUpable
  include Eventable
  include ActionView::Helpers::TagHelper

  belongs_to :room, class_name: "CallRoom", foreign_key: "call_room_id", inverse_of: :calls
  belongs_to :project, optional: true
  has_one :organization, through: :room
  has_many :peers, class_name: "CallPeer", inverse_of: :call, dependent: :destroy_async
  has_many :active_peers, -> { active }, class_name: "CallPeer", inverse_of: :call
  has_many :organization_memberships, through: :peers
  has_many :recordings, class_name: "CallRecording", inverse_of: :call, dependent: :destroy_async
  has_many :summary_sections, through: :recordings, class_name: "CallRecordingSummarySection"
  has_many :chat_links, through: :recordings, class_name: "CallRecordingChatLink"
  has_many :messages, dependent: :nullify
  has_many :timeline_events, as: :subject, dependent: :destroy_async

  delegate :subject, :remote_room_id, :organization, to: :room
  delegate :mrkdwn_link, to: SlackBlockKit

  enum :project_permission, { none: 0, view: 1, edit: 2 }, prefix: :project
  enum :generated_title_status, { processing: 0, completed: 1, failed: 2 }, suffix: true
  enum :generated_summary_status, { processing: 0, completed: 1 }, suffix: true

  after_save :trigger_stale, if: -> {
    [:title, :summary, :generated_summary_status, :generated_title_status].any? do |attribute|
      saved_change_to_attribute?(attribute)
    end
  }

  attr_accessor :event_actor

  scope :active, -> { where(stopped_at: nil) }
  scope :completed, -> { where.not(stopped_at: nil) }
  scope :viewable_by, ->(user) {
    left_outer_joins(:room, :peers, :project)
      # the user is a call participant
      .where(peers: { organization_membership_id: user.organization_memberships })
      # the user is a member of the call room's subject
      .or(where(room: { subject: user.message_threads }))
      # the call's project is not private and user can view all non-private projects
      .or(where(project: { private: false }).merge(Project.with_view_all_permission_for(user, projects_table_alias: :project)))
      # the user has permission to view the call's project
      .or(merge(Project.with_project_membership_for(user, projects_table_alias: :project)))
      .distinct
  }
  scope :editable_by, ->(user) {
    left_outer_joins(:room, :peers, :project)
      # the user is a call participant
      .where(peers: { organization_membership_id: user.organization_memberships })
      # the call's project is not private and has edit permission
      .or(where(project_permission: :edit, project: { private: false }))
      # the user has permission to edit the call's project
      .or(where(project_permission: :edit).merge(Project.with_project_membership_for(user, projects_table_alias: :project)))
      .distinct
  }
  scope :with_peer_member_id, ->(member_id) { where(peers: { organization_membership_id: member_id }) }

  SERIALIZER_EAGER_LOAD = [
    :room,
    :project,
    :unshown_follow_ups,
    {
      peers: [
        :user,
        {
          organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD,
        },
      ],
    },
  ]

  scope :serializer_preload, -> {
    eager_load(SERIALIZER_EAGER_LOAD).preload(room: { subject: { organization_memberships: OrganizationMembership::SERIALIZER_EAGER_LOAD } })
  }
  scope :recorded, -> { joins(:recordings).distinct }

  searchkick \
    callbacks: Rails.env.test? ? :inline : :async,
    text_start: [:title, :summary, :transcription],
    word_start: [:title, :summary, :transcription],
    highlight: [:title, :summary, :transcription],
    filterable: [:organization_id, :has_recordings],
    merge_mappings: true,
    mappings: {
      properties: {
        # created_at is used in the boost_by_recency option, thus in a function_score
        # it must be mapped otherwise searches will crash on empty indices
        created_at: { type: "date" },
      },
    }

  def search_data
    {
      id: id,
      public_id: public_id,
      title: formatted_title,
      summary: plain_summary_text,
      created_at: created_at,
      organization_id: room.organization_id,
      transcription: formatted_transcript,
      has_recordings: recordings.any?,
      project_id: project_id,
    }
  end

  scope :search_import, -> { includes(:room).preload(room: { subject: { organization_memberships: :user } }) }

  def self.scoped_search(
    query:,
    organization:,
    project_public_id: nil,
    limit: 250
  )
    where = {
      organization_id: organization.id,
      has_recordings: true,
    }

    where[:project_id] = Project.find_by(public_id: project_public_id)&.id if project_public_id

    fields = [
      # exact-match phrases get the highest boost
      { title: :phrase, boost: 3 },
      { summary: :phrase, boost: 3 },
      { transcription: :phrase, boost: 3 },

      # boost phrase partial matches
      { title: :text_start, boost: 2 },
      { summary: :text_start, boost: 2 },
      { transcription: :text_start, boost: 2 },

      # least restrictive: match any word in the query
      { title: :word_start },
      { summary: :word_start },
      { transcription: :word_start },
    ]

    search(
      query,
      fields: fields,
      operator: "or",
      boost_by_recency: { created_at: { scale: "7d", offset: "2d", decay: 0.999 } },
      misspellings: { below: 2 },
      where: where,
      limit: limit,
      load: false,
      body_options: {
        highlight: search_highlight_config(query, [:title, :summary, :transcription]),
      },
      boost_where: {
        title: { factor: 2, should_match: 2 },
      },
    )
  end

  def self.scoped_title_search(
    query:,
    organization:,
    limit: 250
  )
    where = {
      organization_id: organization.id,
      has_recordings: true,
    }

    fields = [
      { title: :phrase, boost: 3 },
      { title: :text_start, boost: 2 },
      { title: :word_start },
    ]

    search(
      query,
      fields: fields,
      operator: "or",
      boost_by_recency: { created_at: { scale: "7d", offset: "2d", decay: 0.999 } },
      misspellings: { below: 2 },
      where: where,
      limit: limit,
      load: false,
    )
  end

  def self.create_or_find_by_hms_event!(event)
    create_or_find_by!(remote_session_id: event.session_id) do |call|
      call.room = CallRoom.find_by!(remote_room_id: event.room_id)
      call.started_at = Time.zone.parse(event.session_started_at)

      if call.room.project
        call.project = call.room.project
        call.project_permission = Call.project_permissions[:view]
      end
    end
  end

  def self.viewer_can_edit_async(call_ids, membership)
    return AsyncPreloader.value({}) unless membership

    promise = Call.where(id: call_ids).editable_by(membership.user).async_pluck(:id)

    AsyncPreloader.new(promise) do |value|
      value.index_with { true }
    end
  end

  def active?
    !stopped_at
  end

  def title_or_generated_title
    title.presence || generated_title.presence
  end

  def formatted_title(member = nil)
    title_or_generated_title || subject.try(:default_call_title, member)
  end

  def update_summary_from_recordings!
    update!(
      summary: [recordings.map(&:summary_html).compact.first, links_shared_html].compact.join,
      generated_summary_status: :completed,
    )
  end

  def links_shared_html
    return unless chat_links.any?

    result = content_tag(:h2) { "Links shared" }
    result += content_tag(:ul) do
      line_items = "".html_safe
      chat_links.each do |link|
        line_items += content_tag(:li) { content_tag(:a, href: link.url, target: "_blank") { link.url } }
      end
      line_items
    end
    result
  end

  def plain_summary_text
    HtmlTransform.new(summary).plain_text
  end

  def edited?
    # these fields are present if the user overrode the generated title/summary
    title.present? || summary.present?
  end

  def processing_generated_title?
    processing_generated_title_status?
  end

  def processing_generated_summary?
    processing_generated_summary_status?
  end

  def duration_in_seconds
    @duration_in_seconds ||= stopped_at - started_at
  end

  def formatted_duration
    return if active?

    DurationFormatter.new(in_seconds: duration_in_seconds).format
  end

  def update_recordings_duration!
    update!(recordings_duration: recordings.sum(&:duration_in_seconds) || 0)
  end

  def formatted_recordings_duration
    return if active? || recordings_duration == 0

    DurationFormatter.new(in_seconds: recordings_duration).format
  end

  def trigger_stale
    PusherTriggerJob.perform_async(channel_name, "call-stale", {}.to_json)

    messages.each do |message|
      InvalidateMessageJob.perform_async(message.sender.id, message.id, "update-message")
    end
  end

  def trigger_calls_stale
    PusherTriggerJob.perform_async(organization.channel_name, "calls-stale", {}.to_json)
  end

  def generate_title
    return if formatted_transcript.blank?

    system = <<~PROMPT.squish
      Create a brief, professional title based on a transcript of a video call.
      Each line of the transcript identifies each speaker by name.
      Incorporate the most important keywords or themes from the conversation into the title.
      Format the title as plain text.
      The title MUST NOT exceed 6 words.
      DO NOT use the word "call" or "video".
      DO NOT use quotations or other stylistic punctuation.
      DO NOT use first-person, narrator voice, passive voice, or AI speak.
    PROMPT

    Llm.new.chat(messages: [
      { role: "system", content: system },
      { role: "user", content: formatted_transcript },
    ])
  end

  def formatted_transcript
    return unless recordings.any?

    recordings.map(&:formatted_transcript).compact.join("\n")
  end

  def add_to_project!(project:, permission: Call.project_permissions[:view])
    update!(project: project, project_permission: permission)
  end

  def remove_from_project!
    update!(project: nil, project_permission: :none)
  end

  def project_viewer?(user)
    return false if !user || !project

    (project_view? || project_edit?) && Pundit.policy!(user, project).show?
  end

  def project_editor?(user)
    return false if !user || !project

    project_edit? && Pundit.policy!(user, project).show?
  end

  def hms_session_url
    return unless remote_session_id

    "https://dashboard.100ms.live/session-details/#{remote_session_id}"
  end

  # provide a known org to prevent N+1s
  def path(organization = nil)
    (organization || self.organization).path + "/calls/#{public_id}"
  end

  # provide a known org to prevent N+1s
  def url(organization = nil)
    Campsite.app_url(path: path(organization))
  end

  def favoritable_name(member = nil)
    formatted_title
  end

  def channel_name
    "call-#{public_id}"
  end

  def broadcast_timeline_update
    PusherTriggerJob.perform_async(channel_name, "timeline-events-stale", nil.to_json)
  end

  def follow_up_body_preview
    plain_summary_text&.truncate(60, separator: /\s/)
  end

  def follow_up_summary_blocks(follow_up_member:)
    [].tap do |result|
      if title_or_generated_title.present?
        result.push({ text: { content: title_or_generated_title, bold: true } })
      else
        result.push({ text: { content: "The call" } })
      end

      if project.present?
        result.push({ text: { content: " in " } })
        result.push({ text: { content: project.name, bold: true } })
      end
    end
  end

  def notification_summary(notification:)
    case notification.reason
    when "processing_complete"
      return NotificationSummary.new(
        text: "Your call summary is ready",
        blocks: [
          {
            text: { content: "Your call summary is ready" },
          },
        ],
        slack_mrkdwn: "#{mrkdwn_link(url: url, text: "Your call summary")} is ready",
        email: "Your call summary is ready",
      )
    end

    raise "Couldn't create summary for call #{id} (reason #{notification.reason})"
  end

  def notification_title_plain(notification)
    title_or_generated_title.presence || "the call"
  end

  def notification_title_block(notification)
    if title_or_generated_title.present?
      {
        text: { content: title_or_generated_title, bold: true },
      }
    else
      {
        text: { content: "the call" },
      }
    end
  end

  def notification_target_title
    title.presence || generated_title.presence || "Your call"
  end

  def notification_body_preview(notification:)
    plain_summary_text&.truncate(280, separator: /\s/)
  end

  def notification_body_preview_prefix(notification:)
    "Summary ready" if notification.reason == "processing_complete"
  end

  def notification_preview_url(notification:)
    nil
  end

  def notification_preview_is_canvas(notification:)
    false
  end

  def api_type_name
    "Call"
  end

  def event_organization
    organization
  end

  def export_root_path
    # exporting a call without a project is not supported
    "#{project.export_root_path}/calls/#{public_id}"
  end

  def export_json
    {
      id: public_id,
      title: title_or_generated_title,
      summary: HtmlTransform.new(summary, export: true).markdown,
      created_at: created_at,
      duration: duration_in_seconds,
      peers: peers.map(&:export_json),
    }
  end
end
