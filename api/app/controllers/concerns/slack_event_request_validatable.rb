# frozen_string_literal: true

module SlackEventRequestValidatable
  def validate_request
    slack_request = Slack::Events::Request.new(request)
    return if slack_request.valid?

    # Permit requests from our development Slack app in production.
    # Useful for submitting updates to our app to Slack for review.
    dev_slack_request = Slack::Events::Request.new(request, signing_secret: Rails.application.credentials&.slack_development&.signing_secret)
    return if dev_slack_request.valid?

    render_error(status: :forbidden, code: :forbidden, message: "invalid request")
  end
end
