# frozen_string_literal: true

module Api
  module V1
    class PinsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response code: 204
      def destroy
        pin = ProjectPin.find_by!(public_id: params[:id])
        authorize(pin.project, :remove_pin?)
        pin.discard_by_actor(current_organization_membership)
      end
    end
  end
end
