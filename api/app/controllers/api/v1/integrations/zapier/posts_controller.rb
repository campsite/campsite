# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class PostsController < BaseController
          extend Apigen::Controller

          response model: ZapierPostSerializer, code: 200
          request_params do
            {
              title: { type: :string, required: false },
              content: { type: :string, required: true },
              project_id: { type: :string, required: false },
            }
          end
          def create
            if params[:content].blank?
              return render_error(
                status: :unprocessable_entity,
                code: :unprocessable,
                message: "Post content is required.",
              )
            end

            project = if params[:project_id].present?
              current_organization.projects.find_by!(public_id: params[:project_id])
            else
              current_organization.general_project
            end

            post = Post::CreatePost.new(
              params: {
                description_html: post_description_html,
                title: params[:title],
              },
              project: project,
              organization: current_organization,
              integration: integration,
              oauth_application: current_oauth_application,
            ).run

            render_json(ZapierPostSerializer, post)
          end

          private

          def post_description_html
            enriched = MentionsFormatter.new(markdown).replace
            client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
            html = client.markdown_to_html(markdown: enriched, editor: "markdown")

            html
          rescue StyledText::StyledTextError => e
            Sentry.capture_exception(e)
            fallback_post_description_html
          end

          def fallback_post_description_html
            "<p>#{markdown}</p>"
          end

          def markdown
            params[:content].present? ? params[:content].strip : ""
          end
        end
      end
    end
  end
end
