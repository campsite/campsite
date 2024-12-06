# frozen_string_literal: true

class Favorite < ApplicationRecord
  include PublicIdGenerator
  FAVORITABLE_TYPES = ["Project", "MessageThread", "Note", "Post", "Call"].freeze

  belongs_to :organization_membership, class_name: "OrganizationMembership"
  belongs_to :favoritable, polymorphic: true
  has_one :user, through: :organization_membership

  after_destroy_commit -> { broadcast_favorites_stale }, if: -> { organization_membership }

  acts_as_list scope: :organization_membership, add_new_at: :bottom, top_of_list: 0

  validates :organization_membership, uniqueness: {
    scope: [:favoritable_id, :favoritable_type],
    message: "can only favorite an item once",
  }

  delegate :url,
    :favoritable_accessory,
    :favoritable_private,
    to: :favoritable

  def self.reorder(favorite_id_position_list, organization_membership)
    ActiveRecord::Base.transaction do
      favorite_id_position_list.each do |pair|
        favorite = organization_membership.member_favorites.find_by!(public_id: pair[:id])
        favorite.set_list_position(pair[:position].to_i)
      end
    end
  end

  def project
    favoritable if favoritable_type == Project.polymorphic_name
  end

  def message_thread
    favoritable if favoritable_type == MessageThread.polymorphic_name
  end

  private

  def broadcast_favorites_stale
    PusherTriggerJob.perform_async(user.channel_name, "favorites-stale", nil.to_json)
  end
end
