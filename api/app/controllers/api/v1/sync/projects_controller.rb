# frozen_string_literal: true

module Api
  module V1
    module Sync
      class ProjectsController < V1::BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: SyncProjectSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :list_projects?)
          projects = policy_scope(current_organization.projects.eager_load(:message_thread)).distinct
          render_json(SyncProjectSerializer, projects)
        end
      end
    end
  end
end
