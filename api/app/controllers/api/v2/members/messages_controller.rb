# frozen_string_literal: true

module Api
  module V2
    module Members
      class MessagesController < BaseController
        extend Apigen::Controller

        include MarkdownEnrichable

        api_summary "Create DM"
        api_description <<~DESC
          Creates a new chat message in a direct message thread with a user.
        DESC
        response model: V2MessageSerializer, code: 201
        request_params do
          {
            content_markdown: { type: :string, required: true },
            parent_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_thread, :create_message?)

          message = current_thread.send_message!(
            reply_to: params[:parent_id],
            content: markdown_to_html(params[:content_markdown]),
            sender: nil,
            oauth_application: current_oauth_application,
          )

          if message.errors.empty?
            render_json(V2MessageSerializer, message, status: :created)
          else
            render_unprocessable_entity(message)
          end
        end

        private

        def current_thread
          @current_thread ||= current_oauth_application
            .message_threads
            .where(group: false)
            .with_member_public_ids(current_organization_membership.public_id)
            .first_or_create!(
              group: false,
              owner: current_oauth_application,
              organization_memberships: [current_organization_membership],
            )
        end

        def current_organization_membership
          current_organization.memberships.find_by!(public_id: params[:member_id])
        end
      end
    end
  end
end
