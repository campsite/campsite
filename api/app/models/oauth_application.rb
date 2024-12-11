# frozen_string_literal: true

class OauthApplication < ApplicationRecord
  include ::Doorkeeper::Orm::ActiveRecord::Mixins::Application
  include PublicIdGenerator
  include IntegrationMember
  include Discard::Model

  after_discard :revoke_tokens_and_grants
  after_discard :remove_from_message_threads
  after_discard :deactivate_webhooks

  after_create :notify_campsite

  belongs_to :owner, polymorphic: true, optional: true
  belongs_to :creator, class_name: "OrganizationMembership", optional: true
  has_many :message_thread_memberships, dependent: :destroy
  has_many :message_threads, through: :message_thread_memberships
  has_many :webhooks, dependent: :destroy, as: :owner
  has_many :active_webhooks, -> { enabled }, class_name: "Webhook", as: :owner
  has_many :kept_webhooks, -> { kept }, class_name: "Webhook", as: :owner

  alias_attribute :display_name, :name
  alias_attribute :username, :name

  # This field tracks internal integrations with special properties. Users cannot access this field.
  enum :provider, {
    editor_sync: 0,
    figma: 1,
    zapier: 2,
    cal_dot_com: 4,
  }

  CAMPSITE_NOTIFICATION_POST_ID = "xbsbn74r4u9d"

  def application?
    true
  end

  def tokens_owned_by_organizations?
    zapier?
  end

  def owned_by_organization?
    owner_type == "Organization"
  end

  def owned_by_user?
    owner_type == "User"
  end

  def mentionable?
    kept_webhooks.any?
  end

  def direct_messageable?
    kept_webhooks.any? { |webhook| webhook.includes_event_type?("message.dm") }
  end

  def organization
    owner if owned_by_organization?
  end

  def mention_role_name
    "app"
  end

  def avatar_url(size: nil)
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).url(size: size)
  end

  def avatar_urls
    AvatarUrls.new(avatar_path: avatar_path, display_name: display_name).urls
  end

  def webhooks_attributes=(webhooks_attrs)
    transaction do
      new_webhooks = webhooks_attrs.map do |webhook_attrs|
        if webhook_attrs[:id]
          existing_webhook = webhooks.find_by!(public_id: webhook_attrs[:id])
          existing_webhook.update!(webhook_attrs.except(:id))
          existing_webhook
        else
          webhooks.build(webhook_attrs)
        end
      end

      discarded_webhooks = webhooks.where.not(id: new_webhooks.map(&:id))
      discarded_webhooks.discard_all

      self.webhooks = new_webhooks + discarded_webhooks
      validate!
    end
  end

  def export_json
    {
      id: public_id,
      name: name,
      created_at: created_at,
      deactivated: discarded?,
      type: "oauth_application",
    }
  end

  private

  def revoke_tokens_and_grants
    access_tokens.each(&:revoke)
    access_grants.each(&:revoke)
  end

  def remove_from_message_threads
    message_threads.each do |thread|
      thread.remove_oauth_application!(oauth_application: self, actor: thread.owner)
    end
  end

  def deactivate_webhooks
    active_webhooks.discard_all
  end

  def notify_campsite
    return if editor_sync? || figma?

    return unless Rails.env.production?

    CreateCampsiteCommentJob.perform_async(
      CAMPSITE_NOTIFICATION_POST_ID,
      "#{owner&.name} created a new OAuth application: #{name}",
    )
  end
end
