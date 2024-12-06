# frozen_string_literal: true

module RequestRescuable
  extend ActiveSupport::Concern

  included do
    if Rails.env.production?
      rescue_from StandardError, with: :render_internal_server
    end

    rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
    rescue_from ActiveModel::ValidationError, with: :render_unprocessable_entity
    rescue_from ActiveRecord::RecordNotDestroyed, with: :render_unprocessable_entity
    rescue_from ActiveRecord::RecordNotUnique, with: :render_unprocessable_entity
    rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found
    rescue_from ActionController::ParameterMissing, with: :render_required_params
    rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  end

  def render_unprocessable_entity(error)
    message = if error.respond_to?(:record)
      error.record.errors.full_messages.first
    elsif error.respond_to?(:errors)
      error.errors.full_messages.first
    else
      error.message
    end

    render_error(status: :unprocessable_entity, code: "invalid_request", message: message)
  end

  def render_required_params(error)
    render_error(status: :bad_request, code: "invalid_params", message: error.message)
  end

  def render_record_not_found(_error = nil)
    render_error(status: :not_found, code: :not_found, message: "Record not found.")
  end

  def render_endpoint_not_found
    render_error(status: :not_found, code: :not_found, message: "That endpoint does not exist.")
  end

  def render_forbidden(error = nil)
    message = error.is_a?(Pundit::NotAuthorizedError) ? pundit_policy_message(error) : error.message
    render_error(status: :forbidden, code: "forbidden", message: message)
  end

  def render_unauthorized(error = nil)
    render_error(status: :unauthorized, code: "unauthorized", message: error.message || "Unauthorized")
  end

  def render_internal_server(error = nil)
    Sentry.capture_exception(error)

    message = Rails.env.production? ? "Something unexpected happened, please try again." : error.message
    render_error(
      status: :internal_server_error,
      code: :internal_server_error,
      message: message,
    )
  end

  def render_error(status:, message:, code: nil)
    error_json = {
      code: code,
      message: message,
    }
    render(status: status, json: error_json)
  end

  def pundit_policy_message(exception)
    policy_name = exception.policy.class.to_s.underscore

    I18n.t("#{policy_name}.#{exception.query}", scope: "pundit", default: :default)
  end
end
