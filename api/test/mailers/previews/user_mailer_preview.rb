# frozen_string_literal: true

class UserMailerPreview < ActionMailer::Preview
  def membership_request_accepted
    user = User.first
    organization = Organization.first
    UserMailer.membership_request_accepted(user, organization)
  end
end
