# frozen_string_literal: true

module Api
  module V1
    class OauthApplicationsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response model: OauthApplicationSerializer, is_array: true, code: 200
      def index
        authorize(current_organization, :manage_integrations?)
        render_json(OauthApplicationSerializer, current_organization.kept_oauth_applications.includes(:kept_webhooks), status: :ok)
      end

      response model: OauthApplicationSerializer, code: 201
      request_params do
        {
          name: { type: :string },
          redirect_uri: { type: :string, required: false },
          avatar_path: { type: :string, required: false },
          webhooks: {
            type: :object,
            is_array: true,
            required: false, # remove after clients have updated
            properties: {
              url: { type: :string, required: true },
            },
          },
        }
      end
      def create
        authorize(current_organization, :manage_integrations?)

        oauth_application = current_organization.oauth_applications.create!(
          confidential: false, # required for PKCE, see https://doorkeeper.gitbook.io/guides/ruby-on-rails/pkce-flow
          **params.permit(:name, :redirect_uri, :avatar_path),
          creator: current_organization_membership,
        )

        render_json(OauthApplicationSerializer, oauth_application, status: :created)
      end

      response model: OauthApplicationSerializer, code: 200
      def show
        authorize(current_oauth_application, :show?)
        render_json(OauthApplicationSerializer, current_oauth_application)
      end

      response model: OauthApplicationSerializer, code: 200
      request_params do
        {
          name: { type: :string, required: false },
          redirect_uri: { type: :string, required: false },
          avatar_path: { type: :string, required: false },
          webhooks: {
            type: :object,
            is_array: true,
            required: false, # remove after clients have updated
            properties: {
              id: { type: :string, required: false },
              url: { type: :string, required: true },
              event_types: { type: :string, is_array: true, required: false },
            },
          },
        }
      end
      def update
        authorize(current_oauth_application, :update?)

        current_oauth_application.assign_attributes(params.permit(:name, :redirect_uri, :avatar_path))

        if params.key?(:webhooks)
          current_oauth_application.webhooks_attributes = webhook_params
        end

        current_oauth_application.save!

        render_json(OauthApplicationSerializer, current_oauth_application)
      end

      response code: 204
      def destroy
        authorize(current_oauth_application, :destroy?)
        current_oauth_application.discard
      end

      private

      def current_oauth_application
        @current_oauth_application ||= current_organization.kept_oauth_applications.includes(:webhooks).find_by!(public_id: params[:id])
      end

      def webhook_params
        if params.key?(:webhooks)
          params.permit(webhooks: [:url, :id, event_types: []]).dig(:webhooks).map do |webhook|
            webhook.merge(creator: current_organization_membership)
          end
        else
          []
        end
      end
    end
  end
end
