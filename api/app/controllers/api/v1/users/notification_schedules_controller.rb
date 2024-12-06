# frozen_string_literal: true

module Api
  module V1
    module Users
      class NotificationSchedulesController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:show, :update, :destroy]
        after_action :verify_authorized

        extend Apigen::Controller

        response code: 200, model: NotificationScheduleSerializer
        def show
          authorize(current_user, :show_notification_schedule?)

          schedule = current_user.notification_schedule

          render_json(NotificationScheduleSerializer, { type: schedule ? "custom" : "none", custom: schedule })
        end

        response code: 200
        request_params do
          {
            days: { type: :string, enum: Date::DAYNAMES, is_array: true },
            start_time: { type: :string },
            end_time: { type: :string },
          }
        end
        def update
          authorize(current_user, :update_notification_schedule?)

          schedule = current_user.notification_schedule || current_user.build_notification_schedule
          Date::DAYNAMES.each { |day_name| schedule.public_send("#{day_name.downcase}=", Array(params[:days]).include?(day_name)) }
          schedule.update!(start_time: params[:start_time], end_time: params[:end_time], last_applied_at: nil)
          schedule.apply!

          render_json(CustomNotificationScheduleSerializer, schedule)
        end

        response code: 204
        def destroy
          authorize(current_user, :destroy_notification_schedule?)

          current_user.notification_schedule&.destroy!
        end
      end
    end
  end
end
