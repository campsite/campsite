# frozen_string_literal: true

module Api
  module V1
    module Notifications
      class ReadsController < BaseController
        extend Apigen::Controller

        response code: 201
        def create
          notification.notifications_for_same_member_and_target.update_all(read_at: Time.current)
          render(json: {}, status: :created)
        end

        response code: 200
        def destroy
          notification.mark_unread!
          render_ok
        end

        private

        def notification
          @notification ||= current_organization_membership.notifications.find_by!(public_id: params[:notification_id])
        end
      end
    end
  end
end
