# frozen_string_literal: true

module Api
  module V1
    module Sync
      class CustomReactionsController < V1::BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: SyncCustomReactionSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :list_custom_reactions?)
          render_json(SyncCustomReactionSerializer, policy_scope(current_organization.custom_reactions))
        end
      end
    end
  end
end
