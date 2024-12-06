# frozen_string_literal: true

module Commentable
  extend ActiveSupport::Concern

  included do
    has_many :kept_comments, -> { kept }, class_name: "Comment", as: :subject
    has_one :most_recent_kept_comment, -> { kept.order(created_at: :desc) }, class_name: "Comment", as: :subject
    has_many :comments, dependent: :destroy_async, as: :subject
    has_many :commenters, through: :kept_comments, source: :member

    def preview_commenters
      { latest_commenters: self.class.preview_commenters_async([id]).value[id] || [] }
    end

    def self.preview_commenters_async(subject_ids)
      scope = Comment
        .left_joins(:member, :oauth_application, :integration)
        .includes(:oauth_application, :integration, member: OrganizationMembership::SERIALIZER_EAGER_LOAD)
        .where(
          subject_id: subject_ids,
          subject_type: polymorphic_name,
          discarded_at: nil,
          resolved_at: nil,
          member: { discarded_at: nil },
        )
        # select the subject, author, and latest comment for grouping + sorting later
        .select(:subject_id, :organization_membership_id, :oauth_application_id, :integration_id, "MAX(comments.id) AS latest_id")
        .group(:subject_id, :organization_membership_id, :oauth_application_id, :integration_id)
        .load_async

      AsyncPreloader.new(scope) do |scope|
        hash = scope.each_with_object({}) do |comment, hash|
          subject_id = comment.subject_id
          hash[subject_id] ||= []
          hash[subject_id] << { latest_id: comment.latest_id, author: comment.author }
        end

        # sort each key's array by the latest_id value
        hash.each { |k, v| hash[k] = v.sort_by { |r| r[:latest_id] }.reverse.pluck(:author).take(3) }

        hash
      end
    end

    def searchable_comment_content
      kept_comments.map(&:plain_body_text).join("\n")
    end
  end
end
