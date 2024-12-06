# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class ViewerNotesController < BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: NotePageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
            q: { type: :string, required: false },
            **order_schema(by: ["last_activity_at", "created_at"]),
          }
        end
        def index
          if params[:q].present?
            results = Note.scoped_search(query: params[:q], organization: current_organization, user_id: current_user.id)
            ids = results&.pluck(:id) || []

            render_json(
              NotePageSerializer,
              { results: policy_scope(Note.in_order_of(:id, ids).serializer_preload) },
            )
          else
            current_organization.notes.only_user(current_user)

            render_page(
              NotePageSerializer,
              policy_scope(current_organization.notes.only_user(current_user).kept.serializer_preload),
              order: order_params(default: { last_activity_at: :desc, id: :desc }),
            )
          end
        end
      end
    end
  end
end
