# frozen_string_literal: true

module Api
  module V1
    module Posts
      class GeneratedResolutionsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: GeneratedHtmlSerializer, code: 200
        request_params do
          {
            comment_id: { type: :string, required: false },
          }
        end
        def show
          post = Post
            .eager_load(:project)
            .eager_load_llm_content
            .with_published_state
            .find_by!(public_id: params[:post_id])
          comment = params[:comment_id] ? post.kept_comments.eager_load_user.find_by(public_id: params[:comment_id]) : nil
          authorize(post, :resolve?)

          existing_response = LlmResponse.find_by_prompt(
            subject: post,
            prompt: post.generate_resolution_prompt(comment),
          )

          if existing_response.present?
            render_json(
              GeneratedHtmlSerializer,
              {
                status: GeneratedHtmlSerializer::SUCCESS,
                html: existing_response.response,
                response_id: existing_response.public_id,
              },
            )
          else
            GeneratePostResolutionJob.perform_async(post.public_id, current_organization_membership.id, comment&.public_id)
            render_json(
              GeneratedHtmlSerializer,
              status: GeneratedHtmlSerializer::PENDING,
            )
          end
        end
      end
    end
  end
end
