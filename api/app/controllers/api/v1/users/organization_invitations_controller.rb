# frozen_string_literal: true

module Api
  module V1
    module Users
      class OrganizationInvitationsController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: :index

        extend Apigen::Controller

        response model: OrganizationInvitationSerializer, is_array: true, code: 200
        def index
          render_json(
            OrganizationInvitationSerializer,
            OrganizationInvitation.where(email: current_user.email).limit(25),
            { view: :owner },
          )
        end
      end
    end
  end
end
