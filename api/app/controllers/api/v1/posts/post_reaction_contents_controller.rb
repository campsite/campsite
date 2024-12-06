# frozen_string_literal: true

module Api
  module V1
    module Posts
      # DEPRECATED: use root ReactionsController instead
      class PostReactionContentsController < PostsBaseController
        extend Apigen::Controller

        response code: 204
        def destroy
          reaction = current_post.reactions.find_by!(content: params[:content], member: current_organization_membership)
          authorize(reaction, :destroy?)

          reaction.discard
        end
      end
    end
  end
end
