# frozen_string_literal: true

module Api
  module V1
    class ImageUrlsController < BaseController
      skip_before_action :require_authenticated_user, only: :create
      skip_before_action :require_authenticated_organization_membership, only: :create
      rescue_from ArgumentError, with: :render_unprocessable_entity

      extend Apigen::Controller

      response model: ImageUrlsSerializer, code: 200
      request_params do
        {
          file_path: { type: :string },
        }
      end
      def create
        render_json(ImageUrlsSerializer, ImageUrls.new(file_path: params[:file_path]))
      end
    end
  end
end
