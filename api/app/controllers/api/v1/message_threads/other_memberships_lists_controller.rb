# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class OtherMembershipsListsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: MessageThreadSerializer, code: 200
        request_params do
          {
            member_ids: { type: :string, is_array: true },
          }
        end
        def update
          authorize(current_message_thread, :update_other_members?)

          current_message_thread.update_other_organization_memberships!(
            other_organization_memberships: current_organization.kept_memberships.where(public_id: params[:member_ids]).serializer_eager_load,
            actor: current_organization_membership,
          )

          render_json(MessageThreadSerializer, current_message_thread)
        end

        private

        def current_message_thread
          @current_message_thread ||= current_organization_membership
            .message_threads
            .serializer_includes
            .find_by!(public_id: params[:thread_id])
        end
      end
    end
  end
end
