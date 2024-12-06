# frozen_string_literal: true

module Api
  module V1
    module Sync
      class MessageThreadsController < V1::BaseController
        extend Apigen::Controller

        response model: SyncMessageThreadsSerializer, code: 200
        def index
          authorize(current_organization, :list_threads?)

          threads = current_organization_membership
            .message_threads
            .eager_load(:project, organization_memberships: :user)

          # find all 1:1 threads and their non-viewer members
          dm_threads = threads.select { |thread| thread.members_count == 2 }
          dm_memberships = dm_threads.map(&:organization_memberships).flatten.uniq
            .reject { |membership| membership == current_organization_membership }
          dm_memberships += [current_organization_membership]

          # get all members that are not in any 1:1 threads
          exclude_member_ids = dm_memberships.map(&:id)
          new_thread_members = current_organization.kept_memberships.where.not(id: exclude_member_ids).eager_load(:user)

          render_json(SyncMessageThreadsSerializer, { threads: threads, new_thread_members: new_thread_members })
        end
      end
    end
  end
end
