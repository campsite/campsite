# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostLinksController < PostsBaseController
        extend Apigen::Controller

        response model: PostLinkSerializer, code: 201
        request_params do
          {
            url: { type: :string, required: true },
            name: { type: :string, required: true },
          }
        end
        def create
          authorize(current_post, :update?)

          link = current_post.links.create!(
            url: params[:url],
            name: params[:name],
          )

          if link.errors.empty?
            render_json(PostLinkSerializer, link, status: :created)
          else
            render_unprocessable_entity(link)
          end
        end
      end
    end
  end
end
