# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ForMeNotesController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: NotePageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
            **order_schema(by: ["created_at", "last_activity_at"]),
          }
        end
        def index
          membership_note_ids_scope = current_organization_membership.kept_active_project_membership_notes.select(:id)
          subscribed_note_ids_scope = current_organization_membership.kept_subscribed_notes.select(:id)
          scope = Note.where(id: membership_note_ids_scope)
            .or(Note.where(id: subscribed_note_ids_scope))

          if params[:q].present?
            results = Note.scoped_search(query: params[:q], organization: current_organization)
            ids = results&.pluck(:id) || []

            render_json(
              NotePageSerializer,
              { results: policy_scope(Note.in_order_of(:id, ids).and(scope).serializer_preload) },
            )
          else
            render_page(
              NotePageSerializer,
              policy_scope(scope.serializer_preload),
              order: order_params(default: { last_activity_at: :desc, id: :desc }),
            )
          end
        end
      end
    end
  end
end
