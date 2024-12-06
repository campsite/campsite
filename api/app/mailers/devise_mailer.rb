# frozen_string_literal: true

class DeviseMailer < Devise::Mailer
  # copy pasted from https://github.com/heartcombo/devise/blob/main/app/mailers/devise/mailer.rb
  # for easy reference
  def confirmation_instructions(record, token, opts = {})
    @token = token
    @is_changing_email = record.email.present? && record.unconfirmed_email.present? && record.email != record.unconfirmed_email
    @title = if @is_changing_email
      "Confirm your email change"
    else
      "Confirm your email"
    end
    devise_mail(record, :confirmation_instructions, opts.merge({ subject: @title }))
  end

  def reset_password_instructions(record, token, opts = {})
    @token = token
    @title = "Reset your password"
    devise_mail(record, :reset_password_instructions, opts.merge({ subject: @title }))
  end

  def email_changed(record, opts = {})
    @title = "Your email has changed"
    devise_mail(record, :email_changed, opts.merge({ subject: @title }))
  end

  def password_change(record, opts = {})
    @title = "Your password has changed"
    devise_mail(record, :password_change, opts.merge({ subject: @title }))
  end

  protected

  def devise_mail(record, action, opts = {}, &block)
    initialize_from_record(record)
    campfire_mail(headers_for(action, opts), &block)
  end

  def template_paths
    "mailers/devise"
  end
end
