# frozen_string_literal: true

module Api
  module V1
    module Users
      class ScheduledNotificationsController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:index, :create, :update, :destroy]

        extend Apigen::Controller

        response model: ScheduledNotificationSerializer, is_array: true, code: 200
        def index
          render_json(ScheduledNotificationSerializer, current_user.scheduled_notifications.order(id: :asc))
        end

        response model: ScheduledNotificationSerializer, code: 201
        request_params do
          {
            delivery_day: { type: :string, nullable: true },
            delivery_time: { type: :string },
            time_zone: { type: :string },
            name: { type: :string },
          }
        end
        def create
          authorize(current_user, :create_notification?)

          notification = current_user.scheduled_notifications.create(
            delivery_day: params[:delivery_day],
            delivery_time: params[:delivery_time],
            time_zone: params[:time_zone],
            name: params[:name],
            delivery_offset: params[:delivery_offset] || 0,
          )
          if notification.valid?
            render_json(ScheduledNotificationSerializer, notification, status: :created)
          else
            render_unprocessable_entity(notification)
          end
        end

        response model: ScheduledNotificationSerializer, code: 200
        request_params do
          {
            delivery_day: { type: :string, required: false, nullable: true },
            delivery_time: { type: :string },
            time_zone: { type: :string },
          }
        end
        def update
          authorize(current_user, :update_notification?)

          notification = current_user.scheduled_notifications.find_by!(public_id: params[:id])
          notification.delivery_day = params[:delivery_day]
          notification.delivery_time = params[:delivery_time]
          notification.time_zone = params[:time_zone]

          if notification.save
            render_json(ScheduledNotificationSerializer, notification)
          else
            render_unprocessable_entity(notification)
          end
        end

        response code: 204
        def destroy
          notification = current_user.scheduled_notifications.find_by!(public_id: params[:id])
          notification.destroy!
        end
      end
    end
  end
end
