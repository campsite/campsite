# frozen_string_literal: true

module Api
  module V1
    class ProjectsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: [:index]

      response model: ProjectPageSerializer, code: 200
      request_params do
        {
          filter: { type: :string, required: false },
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
          q: { type: :string, required: false },
        }
      end
      def index
        authorize(current_organization, :list_projects?)

        projects = policy_scope(current_organization.projects)

        if params[:q].present?
          projects = projects.search_by(params[:q])
        end

        projects = if params[:filter] == "archived"
          projects.archived
        else
          projects.not_archived
        end

        render_page(
          ProjectPageSerializer,
          projects.serializer_includes,
          order: { last_activity_at: :desc, id: :desc },
        )
      end

      response model: ProjectSerializer, code: 201
      request_params do
        {
          description: { type: :string, required: false },
          name: { type: :string },
          accessory: { type: :string, required: false },
          cover_photo_path: { type: :string, required: false },
          slack_channel_id: { type: :string, required: false },
          slack_channel_is_private: { type: :boolean, required: false },
          private: { type: :boolean, required: false },
          member_user_ids: { is_array: true, type: :string, required: false },
          is_default: { type: :boolean, required: false, nullable: true },
          add_everyone: { type: :boolean, required: false, nullable: true },
          onboarding: { type: :boolean, required: false, nullable: true },
          chat_format: { type: :boolean, required: false, nullable: true },
        }
      end
      def create
        authorize(current_organization, :create_project?)
        project = current_organization.projects.build(
          accessory: params[:accessory],
          creator: current_organization_membership,
          cover_photo_path: params[:cover_photo_path],
          description: params[:description],
          name: params[:name],
        )

        if params.key?(:slack_channel_id)
          project.update_slack_channel!(
            id: params[:slack_channel_id],
            is_private: params[:slack_channel_is_private] == true,
          )
        end

        if to_bool(params[:private])
          project.private = true
        end

        if params.key?(:is_default)
          project.is_default = params[:is_default] == true && !project.private?
        end

        Project.transaction do
          if to_bool(params[:chat_format])
            message_thread = project.create_message_thread!(owner: current_organization_membership, group: true, title: project.name)
            CreateMessageThreadCallRoomJob.perform_async(message_thread.id)
          end

          project.save!

          BulkProjectMemberships.new(
            project: project,
            creator_user: current_user,
            member_user_public_ids: params[:member_user_ids],
            add_everyone: to_bool(params[:add_everyone]),
          ).create!
        end

        CreateProjectCallRoomJob.perform_async(project.id)

        if to_bool(params[:onboarding])
          Post::CreateDefaultPosts.onboard(member: current_organization_membership, project: project)
        end

        render_json(ProjectSerializer, project, status: :created)
      end

      response model: ProjectSerializer, code: 200
      def show
        authorize(current_project, :show?)

        render_json(ProjectSerializer, current_project)
      end

      response model: ProjectSerializer, code: 200
      request_params do
        {
          description: { type: :string, required: false },
          name: { type: :string, required: false },
          accessory: { type: :string, required: false },
          cover_photo_path: { type: :string, required: false, nullable: true },
          slack_channel_id: { type: :string, required: false, nullable: true },
          slack_channel_is_private: { type: :boolean, required: false, nullable: true },
          is_default: { type: :boolean, required: false, nullable: true },
          private: { type: :boolean, required: false },
        }
      end
      def update
        authorize(current_project, :update?)

        if params.key?(:name)
          current_project.name = params[:name]
          current_project&.message_thread&.title = params[:name]
        end

        if params.key?(:description)
          current_project.description = params[:description]
        end

        if params.key?(:accessory)
          current_project.accessory = params[:accessory]
        end

        if params.key?(:cover_photo_path)
          current_project.cover_photo_path = params[:cover_photo_path]
        end

        if params.key?(:slack_channel_id)
          current_project.update_slack_channel!(
            id: params[:slack_channel_id],
            is_private: params[:slack_channel_is_private] == true,
          )
        end

        if params.key?(:is_default) && policy(current_project).update_default?
          current_project.is_default = params[:is_default] == true
        end

        if params.key?(:private)
          current_project.private = params[:private]
        end

        Project.transaction do
          current_project.save!
          current_project&.message_thread&.save! if current_project&.message_thread&.changed?
        end

        render_json(ProjectSerializer, current_project)
      end

      response code: 204
      def destroy
        authorize(current_project, :destroy?)
        current_project.destroy!
      end

      response model: ProjectSerializer, code: 200
      def archive
        authorize(current_project, :archive?)

        current_project.archive!(current_organization_membership)

        render_json(ProjectSerializer, current_project)
      end

      response model: ProjectSerializer, code: 200
      def unarchive
        authorize(current_project, :unarchive?)

        current_project.unarchive!

        render_json(ProjectSerializer, current_project)
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def cover_photo_presigned_fields
        authorize(current_organization, :show_presigned_fields?)

        presigned_fields = current_organization.generate_project_presigned_post_fields(params[:mime_type])
        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end
    end
  end
end
