# frozen_string_literal: true

class UserPreference < ApplicationRecord
  ENABLED_VALUES = ["enabled", "disabled"].freeze
  TRUTHY_VALUES = ["true", "false"].freeze

  PREFERENCES = {
    theme: ["system", "light", "dark"],
    email_notifications: ENABLED_VALUES,
    message_email_notifications: ENABLED_VALUES,
    prefers_desktop_app: ENABLED_VALUES,
    layout: ["grid", "feed"],
    feature_tip_drafts: TRUTHY_VALUES,
    feature_tip_interstitial: TRUTHY_VALUES,
    feature_tip_note_attachment: TRUTHY_VALUES,
    feature_tip_figma_plugin: TRUTHY_VALUES,
    figma_file_preview_mode: ["embed", "image"],
    notes_layout: ["grid", "list"],
    feature_tip_onboard_install_apps: TRUTHY_VALUES,
    posts_density: ["compact", "comfortable"],
    cal_dot_com_organization_id: /^\d+$/,
    feature_tip_calls_index_integrations: TRUTHY_VALUES,
    home_display_reactions: TRUTHY_VALUES,
    home_display_attachments: TRUTHY_VALUES,
    home_display_comments: TRUTHY_VALUES,
    home_display_resolved: TRUTHY_VALUES,
    channel_composer_post_suggestions: TRUTHY_VALUES,
  }.freeze

  ALL_VALID_KEYS = PREFERENCES.keys.map(&:to_s).freeze

  validates :key, inclusion: { in: ALL_VALID_KEYS, message: "%{value} is not a valid user preference" }
  validate :value_is_valid_for_key

  private

  def value_is_valid_for_key
    return if PREFERENCES[key.to_sym]&.respond_to?(:include?) && PREFERENCES[key.to_sym].include?(value)
    return if PREFERENCES[key.to_sym]&.respond_to?(:match?) && PREFERENCES[key.to_sym].match?(value)

    errors.add(:value, "#{value} is not a valid preference for #{key}")
  end
end
