# frozen_string_literal: true

module Api
  module V1
    module Messages
      class AttachmentsController < BaseController
        extend Apigen::Controller

        response code: 204
        def destroy
          authorize(current_message, :update?)

          attachment = current_message.attachments.find_by!(public_id: params[:id])
          attachment.destroy!

          InvalidateMessageJob.perform_async(current_organization_membership.id, current_message.id, "update-message")

          head(:no_content)
        end

        private

        def current_message
          @current_comment ||= Message
            # includes for policy checks
            .eager_load(:sender)
            .find_by!(public_id: params[:message_id])
        end
      end
    end
  end
end
