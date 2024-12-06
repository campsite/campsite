# frozen_string_literal: true

module Api
  module V1
    class NotificationsController < BaseController
      extend Apigen::Controller

      response model: NotificationPageSerializer, code: 200
      request_params do
        {
          unread: { type: :boolean, required: false },
          filter: { type: :string, enum: [:home, :grouped_home, :activity], required: false },
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
        }
      end
      def index
        notifications = if params[:filter] == "home"
          current_organization_membership
            .inbox_notifications
            .home_inbox
        elsif params[:filter] == "grouped_home"
          current_organization_membership
            .kept_notifications
            .unarchived
            .home_inbox
        elsif params[:filter] == "activity"
          current_organization_membership
            .kept_notifications
            .activity
        else
          current_organization_membership
            .inbox_notifications
        end

        if to_bool(params[:unread])
          notifications = notifications.unread
        end

        render_page(
          NotificationPageSerializer,
          notifications.serializer_preload,
          { order: :desc },
        )
      end

      response code: 204
      request_params do
        {
          archive_by: { type: :string, enum: [:id, :target], required: false },
        }
      end
      def destroy
        archive_by = params[:archive_by] || :target

        case archive_by.to_sym
        when :id
          notification.update(archived_at: Time.current)
        when :target
          notification.notifications_for_same_member_and_target.update_all(archived_at: Time.current)
        else
          render_error(
            status: :unprocessable_entity,
            code: :unprocessable,
            message: "Invalid archive_by value",
          )
        end
      end

      private

      def notification
        @notification ||= current_organization_membership.kept_notifications.unarchived.find_by!(public_id: params[:id])
      end
    end
  end
end
