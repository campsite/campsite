# frozen_string_literal: true

module Api
  module V1
    module Notes
      class FavoritesController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: FavoriteSerializer, code: 201
        def create
          authorize(current_note, :create_favorite?)

          favorite = current_note.favorites.create!(organization_membership: current_organization_membership)

          analytics.track(event: "favorite_added", properties: { subject_type: "note", subject_id: current_note.id })

          render_json(FavoriteSerializer, favorite, status: :created)
        end

        response code: 204
        def destroy
          authorize(current_note, :remove_favorite?)

          analytics.track(event: "favorite_removed", properties: { subject_type: "note", subject_id: current_note.id })

          current_note.favorites.find_by(organization_membership: current_organization_membership)&.destroy!
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
