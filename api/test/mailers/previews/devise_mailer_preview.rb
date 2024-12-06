# frozen_string_literal: true

class DeviseMailerPreview < ActionMailer::Preview
  def confirmation_instructions
    user = User.first
    DeviseMailer.confirmation_instructions(user, "token", {})
  end

  def reset_password_instructions
    user = User.first
    DeviseMailer.reset_password_instructions(user, "token", {})
  end

  def email_changed
    user = User.first
    DeviseMailer.email_changed(user, {})
  end

  def password_change
    user = User.first
    DeviseMailer.password_change(user, {})
  end
end
