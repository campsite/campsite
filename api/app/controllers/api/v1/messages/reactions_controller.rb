# frozen_string_literal: true

module Api
  module V1
    module Messages
      class ReactionsController < BaseController
        extend Apigen::Controller

        response model: ReactionSerializer, code: 201
        request_params do
          {
            content: { type: :string, required: false },
            custom_content_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_message, :react?)

          reaction = current_message.reactions.create(
            content: params[:content],
            custom_content: CustomReaction.find_by(public_id: params[:custom_content_id]),
            member: current_organization_membership,
          )

          InvalidateMessageJob.perform_async(current_organization_membership.id, current_message.id, "update-message")

          if reaction.errors.empty?
            render_json(ReactionSerializer, reaction, status: :created)
          else
            render_unprocessable_entity(reaction)
          end
        end

        private

        def current_message
          @current_comment ||= Message
            # includes for policy checks
            .eager_load(:sender, message_thread: { organization_memberships: OrganizationMembership::SERIALIZER_EAGER_LOAD })
            .preload(message_thread: { owner: :organization })
            .find_by!(public_id: params[:message_id])
        end
      end
    end
  end
end
