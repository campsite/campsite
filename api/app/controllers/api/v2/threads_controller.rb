# frozen_string_literal: true

module Api
  module V2
    class ThreadsController < BaseController
      extend Apigen::Controller

      api_summary "Create thread"
      api_description <<~DESC
        Creates a new thread.
      DESC
      response model: V2MessageThreadSerializer, code: 201
      request_params do
        {
          title: { type: :string, required: false },
          member_ids: {
            type: :string,
            is_array: true,
            required: true,
            description: "The IDs of members to add to the thread.",
          },
        }
      end
      def create
        authorize(current_organization, :create_thread?)

        if params[:member_ids].blank?
          return render_error(status: :bad_request, code: "invalid_params", message: "`member_ids` is required")
        end

        organization_memberships = current_organization
          .kept_memberships
          .where(public_id: params[:member_ids])
          .serializer_eager_load

        thread = MessageThread.create!(
          title: params[:title],
          owner: current_api_actor,
          event_actor: current_api_actor,
          organization_memberships: organization_memberships,
          oauth_applications: [current_oauth_application],
          call_room: nil,
          last_message_at: Time.current,
          # integration threads are always group threads, for now
          group: true,
        )

        CreateMessageThreadCallRoomJob.perform_async(thread.id)

        render_json(V2MessageThreadSerializer, thread, status: :created)
      end
    end
  end
end
