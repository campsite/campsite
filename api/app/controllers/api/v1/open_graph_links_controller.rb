# frozen_string_literal: true

module Api
  module V1
    class OpenGraphLinksController < BaseController
      extend Apigen::Controller

      around_action :force_database_writing_role, only: [:show]

      skip_before_action :require_authenticated_organization_membership, only: [:show, :create]

      response model: OpenGraphLinkSerializer, code: 200
      request_params do
        {
          url: { type: :string, required: true },
        }
      end
      def show
        link = OpenGraphLink.find_or_create_by_url!(params[:url])
        render_json(OpenGraphLinkSerializer, link)
      rescue OpenGraphLink::ParseError => ex
        render_error(status: :unprocessable_entity, code: "unprocessable", message: ex.message)
      end
    end
  end
end
