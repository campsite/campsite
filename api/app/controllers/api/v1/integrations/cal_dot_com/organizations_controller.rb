# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module CalDotCom
        class OrganizationsController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_organization_membership, only: [:show, :update]

          response code: 204
          request_params do
            {
              organization_id: { type: :string },
            }
          end
          def update
            organization = current_user.organizations.find_by!(public_id: params[:organization_id])
            current_user.find_or_initialize_preference(:cal_dot_com_organization_id).update!(value: organization.id)
          end
        end
      end
    end
  end
end
