# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class ReadsController < BaseController
        extend Apigen::Controller

        response model: UserNotificationCountsSerializer, code: 200
        def create
          authorize(current_message_thread, :create_read?)

          current_message_thread.mark_read(current_organization_membership)

          render_json(UserNotificationCountsSerializer, current_user)
        end

        response model: UserNotificationCountsSerializer, code: 200
        def destroy
          authorize(current_message_thread, :mark_unread?)

          current_message_thread.mark_unread(current_organization_membership)

          render_json(UserNotificationCountsSerializer, current_user)
        end

        private

        def current_message_thread
          @current_message_thread ||= current_organization_membership.message_threads.find_by!(public_id: params[:thread_id])
        end
      end
    end
  end
end
