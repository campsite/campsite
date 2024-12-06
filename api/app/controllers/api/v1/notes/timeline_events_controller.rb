# frozen_string_literal: true

module Api
  module V1
    module Notes
      class TimelineEventsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        after_action :verify_policy_scoped, only: :index

        response model: TimelineEventPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        def index
          authorize(current_note, :list_timeline_events?)

          render_page(
            TimelineEventPageSerializer,
            policy_scope(current_note.timeline_events.serializer_preloads),
            order: :desc,
          )
        end

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
