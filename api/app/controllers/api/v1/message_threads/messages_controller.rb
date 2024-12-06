# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class MessagesController < BaseController
        extend Apigen::Controller

        response model: MessagePageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_message_thread, :list_messages?)
          render_page(
            MessagePageSerializer,
            current_message_thread.messages
            .kept
            .eager_load(
              :attachments,
              call: [
                :room,
                { peers: { organization_membership: OrganizationMembership::SERIALIZER_EAGER_LOAD } },
              ],
              sender: OrganizationMembership::SERIALIZER_EAGER_LOAD,
              reply_to: [:attachments, sender: OrganizationMembership::SERIALIZER_EAGER_LOAD],
            )
            .preload(call: { room: { subject: { organization_memberships: OrganizationMembership::SERIALIZER_EAGER_LOAD } } }),
            {
              order: { id: :desc },
            },
          )
        end

        response model: PusherInvalidateMessageSerializer, code: 201
        request_params do
          {
            content: { type: :string },
            reply_to: { type: :string, required: false },
            attachments: {
              type: :object,
              is_array: true,
              properties: Api::V1::AttachmentsController::CREATE_PARAMS,
            },
          }
        end
        def create
          authorize(current_message_thread, :create_message?)

          message = current_message_thread.send_message!(
            sender: current_organization_membership,
            content: params[:content],
            attachments: params.slice(:attachments).permit(attachments: Api::V1::AttachmentsController::CREATE_PARAMS.keys).fetch(:attachments, []),
            reply_to: params[:reply_to],
          )

          render_json(PusherInvalidateMessageSerializer, { message: message, message_thread: current_message_thread }, status: :created)
        end

        response code: 204
        request_params do
          {
            content: { type: :string },
          }
        end
        def update
          authorize(current_message, :update?)

          current_message_thread.update_message!(
            actor: current_organization_membership,
            message: current_message,
            content: params[:content],
          )

          head(:no_content)
        end

        response code: 204
        def destroy
          authorize(current_message, :destroy?)

          current_message_thread.discard_message!(
            actor: current_organization_membership,
            message: current_message,
          )

          head(:no_content)
        end

        private

        def current_message_thread
          @current_message_thread ||= MessageThread
            .serializer_includes
            .find_by!(public_id: params[:thread_id])
        end

        def current_message
          @current_message ||= current_message_thread.messages.eager_load(:attachments).find_by!(public_id: params[:id])
        end
      end
    end
  end
end
