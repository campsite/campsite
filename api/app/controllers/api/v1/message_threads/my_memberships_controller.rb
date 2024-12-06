# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class MyMembershipsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: MessageThreadMembershipSerializer, code: 200
        def show
          authorize(current_message_thread, :show?)
          render_json(MessageThreadMembershipSerializer, current_message_thread.memberships.find_by!(organization_membership: current_organization_membership))
        end

        response model: MessageThreadMembershipSerializer, code: 204
        request_params do
          {
            notification_level: { type: :string, enum: MessageThreadMembership.notification_levels.keys },
          }
        end
        def update
          authorize(current_message_thread, :update?)
          current_message_thread.update_notification_level!(current_organization_membership, params[:notification_level])
        rescue ArgumentError => ex
          current_message_thread.errors.add(:base, ex.message)
          render_unprocessable_entity(current_message_thread)
        end

        response code: 204
        def destroy
          authorize(current_message_thread, :leave?)
          current_message_thread.leave!(current_organization_membership)
        end

        private

        def current_message_thread
          @current_message_thread ||= current_organization_membership
            .message_threads
            .find_by!(public_id: params[:thread_id])
        end
      end
    end
  end
end
