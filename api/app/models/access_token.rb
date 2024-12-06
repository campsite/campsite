# frozen_string_literal: true

class AccessToken < ApplicationRecord
  include ::Doorkeeper::Orm::ActiveRecord::Mixins::AccessToken

  self.table_name = "oauth_access_tokens"

  belongs_to :resource_owner, polymorphic: true

  after_create_commit :broadcast_stale

  def owned_by_organization?
    resource_owner_type == "Organization"
  end

  def owned_by_user?
    resource_owner_type == "User"
  end

  private

  def broadcast_stale
    if resource_owner&.respond_to?(:channel_name)
      PusherTriggerJob.perform_async(resource_owner.channel_name, "access-tokens-stale", nil.to_json)
    end
  end
end
