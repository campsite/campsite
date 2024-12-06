# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class SsoController < V1::BaseController
        extend Apigen::Controller

        response model: OrganizationSerializer, code: 201
        request_params do
          { domains: { type: :string, is_array: true } }
        end
        def create
          authorize(current_organization, :update_sso?)

          current_organization.enable_sso!(domains: params[:domains])
          render_json(OrganizationSerializer, current_organization, { status: :created, view: :show })
        end

        response model: OrganizationSerializer, code: 200
        def destroy
          authorize(current_organization, :update_sso?)

          current_organization.disable_sso!
          render_json(OrganizationSerializer, current_organization, { view: :show })
        end
      end
    end
  end
end
