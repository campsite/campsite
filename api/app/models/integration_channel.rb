# frozen_string_literal: true

class IntegrationChannel < ApplicationRecord
  include PublicIdGenerator

  belongs_to :integration
  has_many :members, class_name: "IntegrationChannelMember", dependent: :destroy_async

  after_destroy :remove_references

  scope :search_name, ->(query_string) { where("integration_channels.name LIKE ?", "%#{query_string}%") }
  scope :not_private, -> { where(private: false) }

  private

  def remove_references
    return if integration && !integration.slack_integration?

    Organization.where(slack_channel_id: provider_channel_id).update_all(slack_channel_id: nil)
    Project.where(slack_channel_id: provider_channel_id).update_all(slack_channel_id: nil)
  end
end
