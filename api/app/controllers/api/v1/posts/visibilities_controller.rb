# frozen_string_literal: true

module Api
  module V1
    module Posts
      class VisibilitiesController < PostsBaseController
        extend Apigen::Controller

        request_params do
          {
            visibility: { type: :string, enum: Post.visibilities.keys },
          }
        end
        def update
          authorize(current_post, :modify_visibility?)
          current_post.update!(visibility: params[:visibility])
        rescue ArgumentError => ex
          current_post.errors.add(:base, ex.message)
          render_unprocessable_entity(current_post)
        end
      end
    end
  end
end
