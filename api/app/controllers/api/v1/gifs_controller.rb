# frozen_string_literal: true

module Api
  module V1
    class GifsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response model: GifsPageSerializer, code: 200
      request_params do
        {
          q: { type: :string, required: false },
          limit: { type: :number, required: false },
          after: { type: :string, required: false },
        }
      end
      def index
        authorize(current_organization, :list_gifs?)

        results = if params[:q].blank?
          tenor_client.featured(limit: params[:limit] || 10, after: params[:after])
        else
          tenor_client.search(query: params[:q], limit: params[:limit] || 10, after: params[:after])
        end

        render_json(GifsPageSerializer, results)
      end

      private

      def tenor_client
        @tenor_client ||= TenorClient.new(api_key: Rails.application.credentials.tenor.api_key)
      end
    end
  end
end
