# frozen_string_literal: true

class NotificationSummary
  def initialize(text:, slack_mrkdwn:, email:, blocks:)
    @text = text
    @slack_mrkdwn = slack_mrkdwn
    @email = email
    @blocks = blocks
  end

  attr_reader :text, :slack_mrkdwn, :email, :blocks
end
