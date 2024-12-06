# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class NotificationForcesController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response code: 204
        def create
          authorize(current_message_thread, :force_notification?)

          current_message_thread.force_notification!(organization_membership: current_organization_membership)
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
