# frozen_string_literal: true

class TimelineEvent < ApplicationRecord
  include PublicIdGenerator

  belongs_to :actor, polymorphic: true, optional: true
  belongs_to :subject, polymorphic: true
  belongs_to :reference, polymorphic: true, optional: true

  enum :action,
    {
      #  post_title_updated: 0, # deprecated
      #  post_description_updated: 1, # deprecated
      post_resolved: 2,
      post_unresolved: 3,
      #  post_project_updated: 4, # deprecated
      post_visibility_updated: 5,
      post_referenced_in_external_record: 6,
      created_linear_issue_from_post: 7,
      #  post_pinned: 8, # deprecated
      #  post_unpinned: 9, # deprecated
      comment_referenced_in_external_record: 10,
      created_linear_issue_from_comment: 11,
      #  post_referenced_in_internal_record: 12, # deprecated
      subject_project_updated: 13,
      subject_referenced_in_internal_record: 15,
      subject_pinned: 16,
      subject_unpinned: 17,
      subject_title_updated: 18,
    },
    suffix: true

  store_accessor :metadata, :from_visibility, :to_visibility, prefix: :post_updated
  store_accessor :metadata, :from_project_id, :to_project_id, prefix: :subject_updated
  store_accessor :metadata, :from_title, :to_title, prefix: :subject_updated

  SERIALIZER_PRELOADS = [
    actor: OrganizationMembership::SERIALIZER_EAGER_LOAD,
    reference: [:external_record, *Post::FEED_INCLUDES, *Note::SERIALIZER_EAGER_LOADS, *Note::SERIALIZER_PRELOADS],
  ]

  scope :serializer_preloads, -> { preload(SERIALIZER_PRELOADS) }
  scope :viewable_by, ->(user) {
    where(reference: [Post.viewable_by(user), Comment.viewable_by(user), Note.viewable_by(user), nil]).or(where(reference_type: "ExternalRecord"))
  }
  scope :linear_actions, -> {
    where(action: [:created_linear_issue_from_post, :created_linear_issue_from_comment]).or(
      where(action: [:post_referenced_in_external_record, :comment_referenced_in_external_record], reference: ExternalRecord.where(service: "linear")),
    )
  }

  validate :validate_post_visibility_updated_metadata, if: :post_visibility_updated_action?
  validate :validate_subject_project_updated_metadata, if: :subject_project_updated_action?
  validate :validate_subject_title_updated_metadata, if: :subject_title_updated_action?
  validate :validate_metadata_nil, if: :post_resolved_action? ||
    :post_unresolved_action? ||
    :post_referenced_in_external_record_action? ||
    :created_linear_issue_from_post_action? ||
    :comment_referenced_in_external_record_action? ||
    :created_linear_issue_from_comment_action? ||
    :subject_referenced_in_internal_record_action? ||
    :subject_pinned_action? ||
    :subject_unpinned_action?

  after_commit :broadcast_timeline_update
  delegate :broadcast_timeline_update, to: :subject, allow_nil: true

  ROLLUP_THRESHOLD_SECONDS = 60.seconds

  def member_actor
    actor if actor.is_a?(OrganizationMembership) || actor.is_a?(OauthApplication)
  end

  def external_reference
    reference if reference.is_a?(ExternalRecord)
  end

  def post_reference
    reference if reference.is_a?(Post)
  end

  def comment_reference
    reference if reference.is_a?(Comment)
  end

  def note_reference
    reference if reference.is_a?(Note)
  end

  private

  def validate_subject_project_updated_metadata
    if !subject_updated_from_project_id && !subject_updated_to_project_id
      errors.add(:metadata, "must include :from_project_id or :to_project_id for subject_updated_project action")
    end
  end

  def validate_subject_title_updated_metadata
    if !subject_updated_from_title && !subject_updated_to_title
      errors.add(:metadata, "must include either :from_title or :to_title for subject_updated_title action")
    end
  end

  def validate_post_visibility_updated_metadata
    if !post_updated_from_visibility || !post_updated_to_visibility
      errors.add(:metadata, "must include :from_visibility and :to_visibility for post_updated_visibility action")
    end
  end

  def validate_metadata_nil
    errors.add(:metadata, "must be nil for this action") unless metadata.nil?
  end
end
