# frozen_string_literal: true

module Users
  module Figma
    class SessionsController < ApplicationController
      extend Apigen::Controller

      rescue_from Pundit::NotAuthorizedError, with: :redirect_to_app

      around_action :force_database_writing_role, only: [:show]

      before_action :authenticate_user!, only: [:show]
      skip_before_action :verify_authenticity_token, only: [:create]

      response model: FigmaKeyPairSerializer, code: 201
      def create
        session["user_return_to"] = "/sign-in/figma/open"
        key_pair = FigmaKeyPair.generate

        render(json: FigmaKeyPairSerializer.render(key_pair), status: :created)
      end

      def show
        session.delete("user_return_to")
        # If no key pair exists, throw up error signal
        key_pair = FigmaKeyPair.find_by(write_key: params[:write_key])
        return redirect_to(new_user_session_path) if key_pair.blank?

        authorize(current_user, :create_plugin?)

        key_pair.authenticate(current_user)
      end

      private

      def redirect_to_app
        redirect_to(Campsite.app_url(path: "/"))
      end
    end
  end
end
