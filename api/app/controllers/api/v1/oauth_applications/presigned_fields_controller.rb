# frozen_string_literal: true

module Api
  module V1
    module OauthApplications
      class PresignedFieldsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: PresignedPostFieldsSerializer, code: 200
        request_params do
          {
            mime_type: { type: :string },
          }
        end
        def show
          authorize(current_organization, :show_presigned_fields?)

          presigned_fields = current_organization.generate_oauth_application_presigned_post_fields(params[:mime_type])
          render_json(PresignedPostFieldsSerializer, presigned_fields)
        end
      end
    end
  end
end
