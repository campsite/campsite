# frozen_string_literal: true

module Api
  module V1
    module Projects
      class FavoritesController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized, except: :index
        after_action :verify_policy_scoped, only: :index

        response model: FavoriteSerializer, code: 201
        def create
          authorize(current_project, :create_favorite?)

          favorite = current_project.favorites.create!(organization_membership: current_organization_membership)

          analytics.track(event: "favorite_added", properties: { subject_type: "project", subject_id: current_project.id })

          render_json(FavoriteSerializer, favorite, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_project, :remove_favorite?)

          analytics.track(event: "favorite_removed", properties: { subject_type: "project", subject_id: current_project.id })

          current_project.favorites.find_by(organization_membership: current_organization_membership)&.destroy!
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
