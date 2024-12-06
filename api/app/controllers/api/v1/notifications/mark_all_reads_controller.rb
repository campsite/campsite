# frozen_string_literal: true

module Api
  module V1
    module Notifications
      class MarkAllReadsController < BaseController
        extend Apigen::Controller

        request_params do
          {
            home_only: { type: :boolean, required: false },
          }
        end
        response code: 201
        def create
          scope = current_organization_membership
            .inbox_notifications
            .unread

          if to_bool(params[:home_only])
            scope = scope.home_inbox
          end

          scope = scope.pluck(:id)

          Notification.where(id: scope).update_all(read_at: Time.current)
          render(json: {}, status: :created)
        end
      end
    end
  end
end
