# frozen_string_literal: true

module Api
  module V1
    module Projects
      class InvitationUrlsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: InvitationUrlSerializer, code: 200
        def create
          authorize(current_project, :reset_invitation_url?)

          current_project.reset_invite_token!

          render_json(InvitationUrlSerializer, current_project)
        end

        response model: InvitationUrlSerializer, code: 200
        def show
          authorize(current_project, :show_invitation_url?)

          render_json(InvitationUrlSerializer, current_project)
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
