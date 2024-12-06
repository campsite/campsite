# frozen_string_literal: true

module Api
  module V1
    class InvitationUrlsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response model: InvitationUrlSerializer, code: 200
      def show
        authorize(current_organization, :invite_member?)

        render_json(InvitationUrlSerializer, current_organization)
      end
    end
  end
end
