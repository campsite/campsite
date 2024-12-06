# frozen_string_literal: true

class ApplicationController < ActionController::Base
  before_action :store_devise_return_to
  before_action :set_sentry_info

  include Pundit::Authorization
  include CurrentAttributable
  include DatabaseRoleSwitchable

  def store_devise_return_to
    if (app_return_to = params[:from])
      full_return_url = Campsite.base_app_url + app_return_to
      return unless full_return_url.host == Campsite.base_app_url.host

      session["user_return_to"] = full_return_url.to_s
    end

    if (admin_return_to = params[:from_admin])
      full_return_url = auth_root_url(subdomain: Campsite.admin_subdomain) + admin_return_to

      session["user_return_to"] = full_return_url.to_s
    end
  rescue URI::InvalidURIError
    session["user_return_to"] = nil
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || Campsite.base_app_url.to_s
  end

  def after_sign_up_path_for(resource)
    stored_location_for(resource) || Campsite.base_app_url.to_s
  end

  def after_sign_out_path_for(_)
    session.delete("user_return_to")
    new_user_session_path
  end

  def set_sentry_info
    if user_signed_in?
      Sentry.set_user(id: current_user.public_id)
    end
  end

  def store_integration_auth_params(params)
    session["integration_auth_params"] = params.to_json
  end

  def integration_auth_params
    @integration_auth_params ||= JSON.parse(session.delete("integration_auth_params") || {}.to_json, symbolize_names: true)
  end

  def store_integration_auth_state(state)
    session["integration_auth_state"] = state
  end

  def integration_auth_state
    session.delete("integration_auth_state")
  end

  def redirect_in_integration_auth_client(app_path:)
    if integration_auth_params[:desktop_app] == "true"
      render("users/desktop/sessions/show", locals: { redirect_path: app_path })
    else
      redirect_to(Campsite.app_url(path: app_path))
    end
  end

  def current_user
    super || User::NullUser.new
  end

  def user_signed_in?
    super && !current_user.is_a?(User::NullUser)
  end
end
