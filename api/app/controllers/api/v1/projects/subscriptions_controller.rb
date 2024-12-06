# frozen_string_literal: true

module Api
  module V1
    module Projects
      class SubscriptionsController < V1::BaseController
        extend Apigen::Controller

        response model: ProjectSerializer, code: 201
        request_params do
          {
            cascade: { type: :boolean, required: false },
          }
        end
        def create
          authorize(current_project, :subscribe?)

          subscription = current_project.subscriptions.create_or_find_by!(user: current_user)
          subscription.update!(cascade: to_bool(params[:cascade]))

          ResetPostSubscriptionsForProjectJob.perform_async(current_user.id, current_project.id) if subscription.cascade_previously_changed?

          render_json(ProjectSerializer, current_project, status: :created)
        end

        response model: ProjectSerializer, code: 200
        def destroy
          authorize(current_project, :unsubscribe?)

          current_project.subscriptions.find_by!(user: current_user).destroy!

          ResetPostSubscriptionsForProjectJob.perform_async(current_user.id, current_project.id)

          render_json(ProjectSerializer, current_project)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
