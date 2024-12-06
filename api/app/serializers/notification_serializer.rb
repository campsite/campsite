# frozen_string_literal: true

class NotificationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :inbox_key
  api_field :inbox?, name: :is_inbox, type: :boolean
  api_field :created_at
  api_field :summary_text, name: :summary
  api_field :read?, name: :read, type: :boolean
  api_field :archived?, name: :archived, type: :boolean
  api_field :organization_slug
  api_field :preview_url, nullable: true
  api_field :preview_is_canvas, type: :boolean, default: false
  api_field :reply_to_body_preview, nullable: true
  api_field :body_preview_prefix, nullable: true
  api_field :body_preview_prefix_fallback, nullable: true
  api_field :body_preview, nullable: true
  api_field :summary_blocks, blueprint: SummaryBlockSerializer, is_array: true

  api_field :activity_seen, type: :boolean do |notification, options|
    next false if options[:member].nil?

    last_seen = options[:member].activity_last_seen_at || options[:member].last_seen_at || options[:member].created_at
    notification.created_at < last_seen
  end

  api_field :reason, enum: Notification.reasons.keys do |notification|
    notification.reason.to_s
  end

  api_association :actor, blueprint: NotificationActorSerializer
  api_association :subject, blueprint: NotificationSubjectSerializer
  api_association :target, blueprint: NotificationTargetSerializer
  api_association :subtarget, blueprint: NotificationSubtargetSerializer, nullable: true

  api_association :reaction, blueprint: NotificationReactionSerializer, nullable: true

  api_association :follow_up_subject, blueprint: NotificationFollowUpSubjectSerializer, nullable: true do |notification, options|
    next nil unless notification.follow_up_subject

    preload_key = FollowUpable.preload_index_key(
      subject_id: notification.follow_up_subject.id,
      subject_type: notification.follow_up_subject.api_type_name,
    )
    {
      public_id: notification.follow_up_subject.public_id,
      api_type_name: notification.follow_up_subject.api_type_name,
      viewer_follow_up: preloads(options, :viewer_follow_up, preload_key),
    }
  end

  def self.preload(notifications, options)
    member = options[:member]
    fu_subjects = notifications.map(&:follow_up_subject)
    {
      viewer_follow_up: FollowUpable.load_follow_up_subject_async(fu_subjects, member),
    }
  end
end
