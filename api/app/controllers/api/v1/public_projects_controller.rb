# frozen_string_literal: true

module Api
  module V1
    class PublicProjectsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: :show

      extend Apigen::Controller

      response model: PublicProjectSerializer, code: 200
      def show
        project = Project.find_by!(invite_token: params[:token])
        render_json(PublicProjectSerializer, project)
      end
    end
  end
end
