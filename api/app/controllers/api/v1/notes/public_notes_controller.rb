# frozen_string_literal: true

module Api
  module V1
    module Notes
      class PublicNotesController < BaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_user, only: :show
        skip_before_action :require_authenticated_organization_membership, only: :show

        before_action :require_organization

        response model: PublicNoteSerializer, code: 200
        def show
          render_json(PublicNoteSerializer, current_note)
        end

        private

        def current_note
          @current_note ||= current_organization
            .notes
            .eager_load(member: [:user, :organization])
            .find_by!(public_id: params[:note_id], discarded_at: nil, visibility: :public)
        end
      end
    end
  end
end
