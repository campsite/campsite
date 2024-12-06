# frozen_string_literal: true

module Api
  module V1
    module Notifications
      class ArchivesController < BaseController
        extend Apigen::Controller

        response code: 201
        def destroy
          notification.unarchive!
        end

        private

        def notification
          @notification ||= current_organization_membership.notifications.find_by!(public_id: params[:notification_id])
        end
      end
    end
  end
end
