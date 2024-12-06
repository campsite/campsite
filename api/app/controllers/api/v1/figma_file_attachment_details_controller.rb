# frozen_string_literal: true

module Api
  module V1
    class FigmaFileAttachmentDetailsController < BaseController
      extend Apigen::Controller

      rescue_from Faraday::TimeoutError, with: :render_unprocessable_entity

      request_params do
        {
          figma_file_url: { type: :string, required: true },
        }
      end
      response model: FigmaFileAttachmentDetailsSerializer, code: 201
      def create
        unless current_user.figma_integration
          return render_error(status: :unprocessable_entity, message: "You must be connected to Figma to generate a Figma file preview.")
        end

        details = FigmaFileAttachmentDetails.new(organization: current_organization, figma_file_url: params[:figma_file_url]).save!
        render_json(FigmaFileAttachmentDetailsSerializer, details, status: :created)
      rescue FigmaClient::ForbiddenError, FigmaClient::NotFoundError => e
        render_error(status: :forbidden, message: e.message)
      end
    end
  end
end
