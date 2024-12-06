# frozen_string_literal: true

module Api
  module V1
    class CallsController < BaseController
      extend Apigen::Controller

      FILTERS = [
        CHATS_FILTER = "chats",
        JOINED_FILTER = "joined",
      ].freeze

      after_action :verify_authorized
      after_action :verify_policy_scoped, only: :index

      response model: CallPageSerializer
      request_params do
        {
          filter: { type: :string, enum: [JOINED_FILTER], required: false },
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
          q: { type: :string, required: false },
        }
      end
      def index
        authorize(current_organization, :list_calls?)

        if params[:q].present?
          results = Call.scoped_search(query: params[:q], organization: current_organization)
          ids = results&.pluck(:id) || []
          scope = Call.in_order_of(:id, ids)

          if params[:filter] == JOINED_FILTER
            scope = scope.with_peer_member_id(current_organization_membership.id)
          end

          render_json(
            CallPageSerializer,
            { results: policy_scope(scope.completed.recorded.serializer_preload) },
          )
        else
          scope = case params[:filter]
          when CHATS_FILTER
            # DEPRECATED: 7/17/24
            current_organization_membership.message_thread_calls
          when JOINED_FILTER
            current_organization_membership.joined_calls
          else
            current_organization_membership.calls
          end

          render_page(
            CallPageSerializer,
            policy_scope(scope.completed.recorded.serializer_preload),
            {
              order: { started_at: :desc },
            },
          )
        end
      end

      response model: CallSerializer, code: 200
      def show
        authorize(current_call, :show?)
        render_json(CallSerializer, current_call)
      end

      response model: CallSerializer
      request_params do
        {
          title: { type: :string },
          summary: { type: :string },
        }
      end
      def update
        authorize(current_call, :update?)

        if params.key?(:title)
          current_call.title = params[:title]
        end

        if params.key?(:summary)
          current_call.summary = params[:summary]
        end

        current_call.save! if current_call.changed?

        render_json(CallSerializer, current_call)
      end

      private

      def current_call
        @current_call ||= Call.serializer_preload.find_by!(public_id: params[:id])
      end
    end
  end
end
