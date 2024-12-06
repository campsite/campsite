# frozen_string_literal: true

class HandleFlipperAuditLogJob < BaseJob
  include Rails.application.routes.url_helpers

  def perform(audit_log_id)
    audit_log = FlipperAuditLog.find(audit_log_id)

    message_text = "#{audit_log.accessory} #{audit_log.user_display_name} #{audit_log.action} the #{flag_link(audit_log)} feature flag"
    message_text += " for #{audit_log.target_display_name}" if audit_log.target_display_name
    message_text += "."

    send_campsite_message(text: message_text)
  end

  private

  def send_campsite_message(text:)
    CampsiteClient.new.create_message(thread_id: feature_flags_thread_id, content: text)
  end

  def flag_link(audit_log)
    "[#{audit_log.feature_name}](#{feature_url(name: audit_log.feature_name, subdomain: Campsite.admin_subdomain)})"
  end

  def default_url_options
    Rails.application.config.action_mailer.default_url_options
  end

  def feature_flags_thread_id
    Rails.application.credentials.dig(:campsite, :feature_flags_thread_id)
  end
end
