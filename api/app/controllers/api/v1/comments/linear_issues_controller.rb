# frozen_string_literal: true

module Api
  module V1
    module Comments
      class LinearIssuesController < BaseController
        extend Apigen::Controller

        before_action :require_linear_integration

        response code: 200, model: CreateLinearIssueSerializer
        request_params do
          {
            team_id: { type: :string, required: true },
            title: { type: :string, required: true },
            description: { type: :string },
          }
        end
        def create
          authorize(current_comment, :create_linear_issue?)

          CreateLinearIssueJob.perform_async(
            params.permit(:title, :description, :team_id).to_json,
            "Comment",
            current_comment.public_id,
            current_organization_membership.id,
          )

          render_json(CreateLinearIssueSerializer, { status: CreateLinearIssueSerializer::PENDING })
        end

        private

        def current_comment
          @current_comment ||= Comment.kept.find_by!(public_id: params[:comment_id])
        end
      end
    end
  end
end
