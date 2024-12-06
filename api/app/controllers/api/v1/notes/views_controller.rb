# frozen_string_literal: true

module Api
  module V1
    module Notes
      class ViewsController < BaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_user, only: [:create]
        skip_before_action :require_authenticated_organization_membership, only: [:create]

        response model: NoteViewSerializer, is_array: true, code: 200
        def index
          authorize(current_note, :list_views?)
          render_json(
            NoteViewSerializer,
            current_note.views.excluding_member(current_organization_membership).serializer_preload.order(updated_at: :desc),
          )
        end

        response model: NoteViewCreatedSerializer, code: 201
        def create
          authorize(current_note, :create_view?)

          unless current_organization_membership
            NonMemberNoteView.find_or_create_from_request!(
              note: current_note,
              user: current_user,
              remote_ip: client_ip,
              user_agent: request.user_agent,
            )

            return render(
              status: :created,
              json: {
                views: [],
                notification_counts: { inbox: {}, messages: {}, posts: {}, home_inbox: {}, activity: {} },
              },
            )
          end

          view = current_note.views.create_or_find_by!(organization_membership: current_organization_membership)
          view.touch

          views = current_note.views.excluding_member(current_organization_membership).serializer_preload.order(updated_at: :desc)

          current_organization_membership.notifications.where(target: current_note, read_at: nil).mark_all_read

          render_json(
            NoteViewCreatedSerializer,
            {
              views: views,
              notification_counts: current_user,
            },
            status: :created,
          )
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
