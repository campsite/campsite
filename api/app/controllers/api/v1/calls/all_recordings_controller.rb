# frozen_string_literal: true

module Api
  module V1
    module Calls
      class AllRecordingsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response code: 204
        def destroy
          authorize(current_call, :destroy_all_recordings?)

          current_call.recordings.destroy_all
          Notification.where(target: current_call).discard_all
          current_call.trigger_stale
          current_call.trigger_calls_stale
        end

        private

        def current_call
          @current_call ||= Call.eager_load(:recordings).find_by!(public_id: params[:call_id])
        end
      end
    end
  end
end
