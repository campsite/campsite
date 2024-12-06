# frozen_string_literal: true

module Api
  module V1
    class ReactionsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response model: CustomReactionSerializer, code: 204
      request_params do
        {
          id: { type: :string },
        }
      end
      def destroy
        authorize(current_reaction, :destroy?)

        current_reaction.discard

        if current_reaction.subject.is_a?(Message)
          InvalidateMessageJob.perform_async(current_organization_membership.id, current_reaction.subject_id, "update-message")
        end
      end

      private

      def current_reaction
        @current_reaction ||= current_organization_membership.reactions.find_by!(public_id: params[:id])
      end
    end
  end
end
