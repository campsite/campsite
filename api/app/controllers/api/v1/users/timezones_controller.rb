# frozen_string_literal: true

module Api
  module V1
    module Users
      class TimezonesController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:create]

        extend Apigen::Controller

        response code: 200
        request_params do
          {
            timezone: { type: :string },
          }
        end
        def create
          current_user.update!(preferred_timezone: params[:timezone])
          render_ok
        end
      end
    end
  end
end
