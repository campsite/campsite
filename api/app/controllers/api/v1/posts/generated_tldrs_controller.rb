# frozen_string_literal: true

module Api
  module V1
    module Posts
      class GeneratedTldrsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: GeneratedHtmlSerializer, code: 200
        def show
          post = Post.eager_load(:project).eager_load_llm_content.with_published_state.find_by!(public_id: params[:post_id])
          authorize(post, :show?)

          existing_response = LlmResponse.find_by_prompt(
            subject: post,
            prompt: post.generate_tldr_prompt,
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
            GeneratePostTldrJob.perform_async(post.public_id, current_organization_membership.id)
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
