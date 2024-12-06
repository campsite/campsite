# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class SsoConfigurationController < V1::BaseController
        skip_before_action :require_org_sso_authentication

        extend Apigen::Controller

        response code: 201 do
          { sso_portal_url: { type: :string } }
        end
        def create
          authorize(current_organization, :update_sso?)

          unless current_organization.workos_organization?
            return render_error(
              status: :unprocessable_entity,
              code: :unprocessable,
              message: "Single Sign-On authentication has not enabled for this organization",
            )
          end

          render(status: :created, json: { sso_portal_url: current_organization.sso_portal_url })
        end
      end
    end
  end
end
