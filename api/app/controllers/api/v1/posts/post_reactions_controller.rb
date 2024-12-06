# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostReactionsController < PostsBaseController
        extend Apigen::Controller

        response model: ReactionSerializer, code: 201
        request_params do
          {
            content: { type: :string, required: false },
            custom_content_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_post, :create_reaction?)

          reaction = current_post.reactions.create(
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
      end
    end
  end
end
