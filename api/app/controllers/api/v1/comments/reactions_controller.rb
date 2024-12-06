# frozen_string_literal: true

module Api
  module V1
    module Comments
      class ReactionsController < BaseController
        extend Apigen::Controller

        response model: ReactionSerializer, code: 201
        request_params do
          {
            content: { type: :string, required: false },
            custom_content_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_comment, :create_reaction?)

          reaction = current_comment.reactions.create(
            content: params[:content],
            custom_content: CustomReaction.find_by(public_id: params[:custom_content_id]),
            member: current_organization_membership,
          )

          if reaction.errors.empty?
            render_json(ReactionSerializer, reaction, status: :created)
          else
            render_unprocessable_entity(reaction)
          end
        end

        private

        def current_comment
          @current_comment ||= Comment.kept.find_by!(public_id: params[:comment_id])
        end
      end
    end
  end
end
