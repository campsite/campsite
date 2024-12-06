# frozen_string_literal: true

module Api
  module V1
    module Calls
      class RecordingsController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index
        after_action :verify_authorized

        response code: 200, model: CallRecordingPageSerializer
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_call, :list_recordings?)

          render_page(CallRecordingPageSerializer, policy_scope(current_call.recordings))
        end

        private

        def current_call
          @current_call ||= Call.serializer_preload.find_by!(public_id: params[:call_id])
        end
      end
    end
  end
end
