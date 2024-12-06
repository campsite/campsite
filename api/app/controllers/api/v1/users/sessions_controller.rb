# frozen_string_literal: true

module Api
  module V1
    module Users
      class SessionsController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: :destroy

        extend Apigen::Controller

        response code: 200
        def destroy
          sign_out

          render_ok
        end
      end
    end
  end
end
