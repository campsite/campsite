# frozen_string_literal: true

module SlackCallbackable
  def slack_client_id
    if Flipper.enabled?(:force_dev_slackbot, current_user)
      Rails.application.credentials.slack_development.client_id
    else
      Rails.application.credentials.slack.client_id
    end
  end

  def slack_client_secret
    if Flipper.enabled?(:force_dev_slackbot, current_user)
      Rails.application.credentials.slack_development.client_secret
    else
      Rails.application.credentials.slack.client_secret
    end
  end

  def validate_state
    session_state = integration_auth_state
    return if params[:state] && session_state && ActiveSupport::SecurityUtils.secure_compare(params[:state], session_state)

    @error_message = "Invalid state"
    render("errors/show", status: :forbidden)
  end
end
