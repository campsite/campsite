# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  include CampsiteApi::Application.routes.url_helpers

  append_view_path Rails.root.join("app/views/mailers")

  # suppress those lovely Out Of Office auto responses
  default "X-Auto-Response-Suppress" => "All"

  default from: proc { noreply_email },
    charset: "UTF-8"

  layout "mailer"

  rescue_from Postmark::InactiveRecipientError, with: :handle_inactive_recipient_error

  module ApplicationHelper
    def noreply_email
      "Campsite <no-reply@campsite.com>"
    end

    def support_email
      "Campsite Support <support@campsite.com>"
    end

    def format_user_email(user)
      return "#{user.name} <#{user.email}>" if user.name

      user.email
    end

    def image_path(asset)
      if Rails.env.production?
        # return cache link
      else
        "/#{asset}"
      end
    end
  end

  include ApplicationHelper
  helper ApplicationHelper

  protected

  def campfire_mail(headers = {}, &block)
    return if EmailBounce.exists?(email: headers[:to])

    mail(headers, &block)
  end

  def handle_inactive_recipient_error(error)
    Rails.logger.info("Error when sending #{message} to #{error.recipients.join(", ")}")
    Rails.logger.info(error)

    error.recipients.each do |recipient|
      EmailBounce.find_or_initialize_by(email: recipient).touch(:updated_at)
    end
  end
end
