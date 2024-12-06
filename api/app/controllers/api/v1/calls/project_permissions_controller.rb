# frozen_string_literal: true

module Api
  module V1
    module Calls
      class ProjectPermissionsController < BaseController
        extend Apigen::Controller

        response model: CallSerializer, code: 200
        request_params do
          {
            project_id: { type: :string },
            # instead of sending "none", call #destroy to remove project permissions
            permission: { type: :string, enum: Call.project_permissions.keys - ["none"] },
          }
        end
        def update
          authorize(current_call, :update_permission?)

          project = current_organization.projects.find_by!(public_id: params[:project_id])

          current_call.add_to_project!(project: project, permission: params[:permission])
          render_json(CallSerializer, current_call)
        end

        response code: 204
        def destroy
          authorize(current_call, :destroy_permission?)

          current_call.remove_from_project!
        end

        private

        def current_call
          @current_call ||= Call.serializer_preload.find_by!(public_id: params[:call_id])
        end
      end
    end
  end
end
