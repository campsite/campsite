# frozen_string_literal: true

class UserMailer < ApplicationMailer
  self.mailer_name = "mailers/user"

  def membership_request_accepted(user, organization)
    @organization = organization
    @user = user
    @title = "Your request to join #{@organization.name} on Campsite was approved"

    campfire_mail(subject: @title, to: @user.email, tag: "membership-request-accepted")
  end
end
