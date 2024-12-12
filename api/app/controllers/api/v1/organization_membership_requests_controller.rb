# frozen_string_literal: true

module Api
  module V1
    class OrganizationMembershipRequestsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: [:create, :show]
      skip_before_action :require_org_two_factor_authentication, only: [:create, :show]

      extend Apigen::Controller

      response model: OrganizationMembershipRequestPageSerializer, code: 200
      request_params do
        {
          after: { type: :string, required: false },
        }
      end
      def index
        authorize(current_organization, :list_membership_requests?)
        requests = current_organization.membership_requests.includes(:user)
        render_page(OrganizationMembershipRequestPageSerializer, requests, { order: :desc })
      end

      response code: 200 do
        { requested: { type: :boolean } }
      end
      def show
        org = Organization.friendly.find(params[:org_slug])
        authorize(org, :show_membership_request?)

        request = org.membership_requests.find_by(user: current_user)

        render(status: :ok, json: { requested: !!request })
      end

      response model: OrganizationMembershipRequestSerializer, code: 201
      def create
        org = Organization.friendly.find(params[:org_slug])
        authorize(org, :create_membership_request?)

        request = org.membership_requests.create!(user: current_user)

        render_json(OrganizationMembershipRequestSerializer, request, status: :created)
      end

      response code: 204
      def approve
        request = current_organization.membership_requests.find_by!(public_id: params[:id])
        authorize(request, :approve?)

        request.approve!
      end

      response code: 204
      def decline
        request = current_organization.membership_requests.find_by!(public_id: params[:id])
        authorize(request, :decline?)

        request.decline!
      end
    end
  end
end
