# frozen_string_literal: true

module Api
  module V1
    class MessageThreadsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized

      response model: MessageThreadInboxSerializer, code: 200
      def index
        authorize(current_organization, :list_threads?)

        threads = current_organization_membership
          .non_project_message_threads
          .serializer_includes
          .order(last_message_at: :desc, id: :desc)

        render_json(
          MessageThreadInboxSerializer,
          { threads: threads },
        )
      end

      response model: MessageThreadSerializer, code: 200
      def show
        authorize(current_message_thread, :show?)
        render_json(MessageThreadSerializer, current_message_thread)
      end

      response model: MessageThreadSerializer, code: 201
      request_params do
        {
          group: { type: :boolean, required: false },
          title: { type: :string, required: false },
          member_ids: { type: :string, is_array: true, required: false },
          oauth_application_ids: { type: :string, is_array: true, required: false },
          content: { type: :string, required: false },
          attachments: {
            type: :object,
            is_array: true,
            properties: {
              file_path: { type: :string },
              file_type: { type: :string },
              preview_file_path: { type: :string, nullable: true },
              width: { type: :number, required: false },
              height: { type: :number, required: false },
              duration: { type: :number, required: false },
              name: { type: :string, required: false, nullable: true },
              size: { type: :number, required: false, nullable: true },
            },
          },
        }
      end
      def create
        authorize(current_organization, :create_thread?)

        organization_memberships = current_organization
          .kept_memberships
          .where(public_id: params[:member_ids])
          .serializer_eager_load

        oauth_applications = current_organization.kept_oauth_applications.where(public_id: params[:oauth_application_ids])

        organization_memberships += [current_organization_membership]
        organization_memberships.uniq!

        thread = MessageThread.create!(
          title: params[:title],
          owner: current_organization_membership,
          event_actor: current_organization_membership,
          organization_memberships: organization_memberships,
          oauth_applications: oauth_applications,
          group: params[:group].presence || organization_memberships.size > 2,
          call_room: nil,
          project: nil,
          last_message_at: Time.current,
        )

        CreateMessageThreadCallRoomJob.perform_async(thread.id)

        if params[:content].present?
          thread.send_message!(
            sender: current_organization_membership,
            content: params[:content],
            attachments: params.slice(:attachments).permit(attachments: [:file_path, :file_type, :preview_file_path, :width, :height, :duration, :name, :size]).fetch(:attachments, []),
          )
        end

        render_json(MessageThreadSerializer, thread, status: :created)
      end

      response model: MessageThreadSerializer, code: 200
      request_params do
        {
          title: { type: :string, required: false },
          image_path: { type: :string, nullable: true, required: false },
        }
      end
      def update
        authorize(current_message_thread, :update?)

        if params.key?(:title)
          current_message_thread.title = params[:title].presence
        end

        if params.key?(:image_path)
          current_message_thread.image_path = params[:image_path].presence
        end

        if current_message_thread.changed?
          current_message_thread.event_actor = current_organization_membership
          current_message_thread.save!
        end

        render_json(MessageThreadSerializer, current_message_thread)
      end

      response code: 204
      def destroy
        authorize(current_message_thread, :destroy?)

        current_message_thread.destroy!
      end

      private

      def current_message_thread
        @current_message_thread ||= MessageThread
          .serializer_includes
          .find_by!(public_id: params[:id])
      end
    end
  end
end
