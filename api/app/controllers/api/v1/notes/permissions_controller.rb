# frozen_string_literal: true

module Api
  module V1
    module Notes
      class PermissionsController < BaseController
        extend Apigen::Controller

        response model: PermissionSerializer, is_array: true, code: 200
        def index
          authorize(current_note, :list_permissions?)
          permissions = current_note.kept_permissions
            .eager_load(:user)
            .order(created_at: :asc)
          render_json(PermissionSerializer, permissions)
        end

        response model: PermissionSerializer, is_array: true, code: 201
        request_params do
          {
            member_ids: { type: :string, is_array: true },
            permission: { type: :string, enum: Permission.actions.keys },
          }
        end
        def create
          authorize(current_note, :create_permission?)
          members = current_organization.kept_memberships.where(public_id: params[:member_ids])
          permissions = members.map do |member|
            permission = current_note.permissions.find_or_initialize_by(user: member.user)
            permission.event_actor = current_organization_membership
            permission.action = params[:permission]
            permission.discarded_at = nil
            permission
          end

          # save all the permissions and return the ones that failed
          failed_permissions = permissions.reject(&:save)

          if failed_permissions.empty?
            render_json(PermissionSerializer, permissions, status: :created)
          else
            render_unprocessable_entity(failed_permissions)
          end
        end

        response model: PermissionSerializer, code: 200
        request_params do
          {
            permission: { type: :string, enum: Permission.actions.keys },
          }
        end
        def update
          authorize(current_note, :update_permission?)

          permission = current_note.permissions.find_by!(public_id: params[:id])
          permission.action = params[:permission]
          permission.event_actor = current_organization_membership

          if permission.save
            render_json(PermissionSerializer, permission)
          else
            render_unprocessable_entity(current_note)
          end
        end

        response code: 204
        def destroy
          authorize(current_note, :destroy_permission?)
          permission = current_note.permissions.find_by!(public_id: params[:id])
          permission.discard_by_actor(current_organization_membership)
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
