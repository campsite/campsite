# frozen_string_literal: true

class ExternalRecord < ApplicationRecord
  include Referenceable

  REFERENCEABLE_METADATA_FIELDS = [:description, :body]

  has_many :timeline_events, as: :reference, dependent: :destroy_async
  has_many :children, class_name: "ExternalRecord", foreign_key: :parent_id, dependent: :nullify
  belongs_to :parent, class_name: "ExternalRecord", optional: true

  validates :remote_record_id, presence: true
  validates :remote_record_title, presence: true

  store_accessor :metadata, :url, prefix: :remote_record
  store_accessor :metadata, :type

  before_validation :set_default_metadata

  enum :service, { linear: 0 }

  after_update_commit :broadcast_timeline_event_updates

  def broadcast_timeline_event_updates
    timeline_events.each(&:broadcast_timeline_update)
  end

  def linked_post_ids
    @post_ids ||= REFERENCEABLE_METADATA_FIELDS.map { |field| extract_post_ids(metadata[field.to_s]) }.flatten.uniq
  end

  def linked_comment_ids
    @comment_ids ||= REFERENCEABLE_METADATA_FIELDS.map { |field| extract_comment_ids(metadata[field.to_s]) }.flatten.uniq
  end

  def contains_campsite_references?
    linked_post_ids.any? || linked_comment_ids.any?
  end

  def create_post_references
    linked_post_ids.each do |post_id|
      post = Post.find_by(public_id: post_id)

      next if post.nil?

      # skip if an issue is already associated with this post
      next if timeline_events.exists?(subject: post, action: :created_linear_issue_from_post)

      timeline_events.create!(
        subject: post,
        action: :post_referenced_in_external_record,
      )
    end
  end

  def referenceable_fields
    [metadata[:description], metadata[:body]]
  end

  def linear_issue_identifier
    if linear_issue?
      metadata.dig("identifier")
    elsif linear_comment?
      parent&.linear_issue_identifier
    end
  end

  def linear_issue_state
    if linear_issue?
      metadata.dig("state")
    elsif linear_comment?
      parent&.linear_issue_state
    end
  end

  private

  def linear_issue?
    linear? && metadata.dig("type") == "Issue"
  end

  def linear_comment?
    linear? && metadata.dig("type") == "Comment"
  end

  def set_default_metadata
    self.metadata ||= {}
  end
end
