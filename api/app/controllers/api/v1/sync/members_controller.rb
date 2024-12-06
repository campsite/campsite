# frozen_string_literal: true

module Api
  module V1
    module Sync
      class MembersController < V1::BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: SyncOrganizationMemberSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :list_members?)
          members = policy_scope(current_organization.memberships).eager_load(:user)
          render_json(SyncOrganizationMemberSerializer, members)
        end
      end
    end
  end
end
