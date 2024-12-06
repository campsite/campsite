# frozen_string_literal: true

module Api
  module V1
    class PublicOrganizationsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: :show

      extend Apigen::Controller

      response model: PublicOrganizationSerializer, code: 200
      def show
        organization = Organization.find_by!(invite_token: params[:token])
        render_json(PublicOrganizationSerializer, organization)
      end
    end
  end
end
