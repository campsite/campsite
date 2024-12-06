# frozen_string_literal: true

module Api
  module V1
    module Projects
      class PinsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: ProjectPinListSerializer, code: 200
        def index
          authorize(current_project, :list_pins?)

          scope = current_project
            .kept_pins
            .order(position: :asc)
            .preload(subject: Post::FEED_INCLUDES + Note::SERIALIZER_EAGER_LOADS + Note::SERIALIZER_PRELOADS)
          render_json(ProjectPinListSerializer, { data: policy_scope(scope) })
        end

        response code: 204
        def destroy
          authorize(current_project, :remove_pin?)

          current_project.pins.find_by!(public_id: params[:id]).discard_by_actor(current_organization_membership)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
