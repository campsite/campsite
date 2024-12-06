# frozen_string_literal: true

module Api
  module V1
    module Notes
      class PinsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: ProjectPinCreatedSerializer, code: 201
        def create
          authorize(current_note, :create_pin?)

          pin = current_note.project.pins.create_or_find_by(subject: current_note, pinner: current_organization_membership)
          pin.undiscard if pin.discarded?

          render_json(ProjectPinCreatedSerializer, { pin: pin }, status: :created)
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.serializer_preload.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
