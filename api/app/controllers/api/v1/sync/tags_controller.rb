# frozen_string_literal: true

module Api
  module V1
    module Sync
      class TagsController < V1::BaseController
        extend Apigen::Controller

        after_action :verify_policy_scoped, only: :index

        response model: TagSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :list_tags?)
          tags = policy_scope(current_organization.tags)
          render_json(TagSerializer, tags)
        end
      end
    end
  end
end
