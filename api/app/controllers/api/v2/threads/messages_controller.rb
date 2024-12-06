# frozen_string_literal: true

module Api
  module V2
    module Threads
      class MessagesController < BaseController
        extend Apigen::Controller

        include MarkdownEnrichable

        api_summary "List messages"
        api_description <<~DESC
          Lists all messages in a thread.
        DESC
        response model: V2MessagePageSerializer, code: 200
        request_params do
          {
            after: {
              type: :string,
              required: false,
              description: "Use with `next_cursor` and `prev_cursor` in the response to paginate through results.",
            },
            limit: {
              type: :number,
              required: false,
              description: "Specifies how many records to return. The default and maximum is 50.",
            },
            **v2_order_schema(by: Message::PUBLIC_API_ALLOWED_ORDER_FIELDS),
          }
        end
        def index
          authorize(current_thread, :list_messages?)

          render_page(
            V2MessagePageSerializer,
            policy_scope(current_thread.messages.public_api_includes),
            order: order_params(default: { created_at: :desc }),
          )
        end

        api_summary "Create message"
        api_description <<~DESC
          Creates a new chat message.
        DESC
        response model: V2MessageSerializer, code: 201
        request_params do
          {
            content_markdown: {
              type: :string,
              required: true,
              description: "The message content in Markdown format.",
            },
            parent_id: {
              type: :string,
              required: false,
              description: "The ID of the parent message.",
            },
          }
        end
        def create
          authorize(current_thread, :create_message?)

          message = current_thread.send_message!(
            reply_to: params[:parent_id],
            content: markdown_to_html(params[:content_markdown]),
            sender: current_organization_membership,
            oauth_application: current_organization_membership ? nil : current_oauth_application,
          )

          if message.errors.empty?
            render_json(V2MessageSerializer, message, status: :created)
          else
            render_unprocessable_entity(message)
          end
        end

        private

        def current_thread
          @current_thread ||= begin
            MessageThread.find_by!(public_id: params[:thread_id])
          rescue ActiveRecord::RecordNotFound => e
            project = Project.find_by!(public_id: params[:thread_id])
            project.message_thread || raise(e)
          end
        end

        def allowed_order_fields
          Message::PUBLIC_API_ALLOWED_ORDER_FIELDS
        end
      end
    end
  end
end
