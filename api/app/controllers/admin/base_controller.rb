# frozen_string_literal: true

module Admin
  class BaseController < ApplicationController
    layout "admin"

    before_action :require_authenticated_staff

    helper_method :breadcrumbs

    private

    def require_authenticated_staff
      return if user_signed_in? && current_user.staff?
      raise ActionController::RoutingError, "not found" if user_signed_in? && !current_user.staff?

      redirect_to(new_user_session_url(from_admin: request.fullpath))
    end

    def breadcrumbs
      @breadcrumbs ||= []
    end

    def add_breadcrumb(name, path = nil)
      breadcrumbs << Breadcrumb.new(name, path)
    end
  end
end
