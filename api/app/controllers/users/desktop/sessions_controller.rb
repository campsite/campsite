# frozen_string_literal: true

module Users
  module Desktop
    class SessionsController < ApplicationController
      before_action :authenticate_user!, only: [:show]
      around_action :force_database_writing_role, only: [:show]

      def new
        render("users/desktop/sessions/new")
      end

      def show
        sso_id = session[:sso_session_id]
        current_user.generate_login_token!(sso_id: sso_id)
      end

      protected

      def store_devise_return_to
        session["user_return_to"] = open_desktop_session_url
      end
    end
  end
end
