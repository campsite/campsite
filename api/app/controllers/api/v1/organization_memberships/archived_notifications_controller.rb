# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ArchivedNotificationsController < BaseController
        extend Apigen::Controller

        response model: NotificationPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          notifications = current_organization_membership
            .archived_inbox_notifications
            .home_inbox

          render_page(
            NotificationPageSerializer,
            notifications.serializer_preload,
            { order: { archived_at: :desc } },
          )
        end
      end
    end
  end
end
