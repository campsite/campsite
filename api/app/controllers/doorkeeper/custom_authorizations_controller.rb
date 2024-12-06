# frozen_string_literal: true

module Doorkeeper
  class CustomAuthorizationsController < AuthorizationsController
    include Pundit::Authorization
    include DatabaseRoleSwitchable

    rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

    around_action :force_database_writing_role, only: [:new]

    before_action :ensure_current_user_is_authorized_for_resource_owner, only: [:create]
    before_action :ensure_application_is_not_discarded

    private

    def ensure_current_user_is_authorized_for_resource_owner
      resource_owner_id = params[:resource_owner_id] || current_resource_owner.id
      resource_owner_class = params[:resource_owner_type]&.constantize || current_resource_owner.class

      authorize(resource_owner_class.find(resource_owner_id), :create_oauth_access_grant?)
    end

    def ensure_application_is_not_discarded
      return unless params[:client_id]

      app = OauthApplication.kept.find_by(uid: params[:client_id])

      render_not_found unless app
    end

    def render_forbidden(error = nil)
      message = error.is_a?(Pundit::NotAuthorizedError) ? "This action requires additional privileges." : error.message
      render(status: :forbidden, json: { code: "forbidden", message: message })
    end

    def render_not_found
      render(status: :not_found, json: { code: "not_found", message: "Not found" })
    end
  end
end
