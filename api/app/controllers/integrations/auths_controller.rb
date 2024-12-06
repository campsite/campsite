# frozen_string_literal: true

module Integrations
  class AuthsController < ApplicationController
    before_action :validate_auth_url, only: :new

    def new
      store_integration_auth_params(auth_params)
      store_integration_auth_state(Rack::Utils.parse_query(URI.parse(params[:auth_url]).query)["state"])
      redirect_to(params[:auth_url], allow_other_host: true)
    end

    private

    def auth_params
      params.slice(:success_path, :desktop_app, :enable_notifications).permit!
    end

    def validate_auth_url
      URI.parse(params[:auth_url])
    rescue URI::InvalidURIError
      @error_message = "Invalid auth url"
      render("errors/show", status: :bad_request)
    end
  end
end
