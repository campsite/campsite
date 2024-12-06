# frozen_string_literal: true

module FollowUpable
  extend ActiveSupport::Concern

  included do
    has_many :follow_ups, dependent: :destroy_async, as: :subject
    has_many :unshown_follow_ups, -> { unshown }, class_name: "FollowUp", as: :subject
  end

  def self.preload_index_key(subject_id:, subject_type:)
    "#{subject_id}-#{subject_type}"
  end

  def self.load_follow_up_subject_async(subjects, member)
    return AsyncPreloader.value({}) unless member

    scope = FollowUp
      .where(organization_membership_id: member.id)
      .where(subject: subjects)
      .unshown
      &.load_async

    AsyncPreloader.new(scope) do |scope|
      scope.index_by { |follow_up| preload_index_key(subject_id: follow_up.subject_id, subject_type: follow_up.subject_type) }
    end
  end
end
