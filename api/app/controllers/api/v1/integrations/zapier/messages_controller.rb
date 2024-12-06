# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class MessagesController < BaseController
          extend Apigen::Controller

          response model: ZapierMessageSerializer, code: 200
          request_params do
            {
              content: { type: :string, required: true },
              thread_id: { type: :string, required: false },
              parent_id: { type: :string, required: false },
            }
          end
          def create
            if params[:content].blank?
              return render_error(status: :unprocessable_entity, code: :invalid_request, message: "Message content required")
            end

            message = ZapierMessage.new(
              thread_id: params[:thread_id],
              parent_id: params[:parent_id],
              content: content_html,
              integration: integration,
              organization: current_organization,
              oauth_application: current_oauth_application,
            ).create!

            render_json(ZapierMessageSerializer, message)
          end

          private

          def content_html
            enriched = MentionsFormatter.new(params[:content]).replace
            client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
            html = client.markdown_to_html(markdown: enriched, editor: "chat")

            html
          rescue StyledText::StyledTextError => e
            Sentry.capture_exception(e)
            params[:content]
          end
        end
      end
    end
  end
end
