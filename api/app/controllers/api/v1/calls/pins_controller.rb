# frozen_string_literal: true

module Api
  module V1
    module Calls
      class PinsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: ProjectPinCreatedSerializer, code: 201
        def create
          authorize(current_call, :create_pin?)

          pin = current_call.project.pins.create_or_find_by(subject: current_call, pinner: current_organization_membership)
          pin.undiscard if pin.discarded?

          render_json(ProjectPinCreatedSerializer, { pin: pin }, status: :created)
        end

        private

        def current_call
          @current_call ||= Call.serializer_preload.find_by!(public_id: params[:call_id])
        end
      end
    end
  end
end
