# frozen_string_literal: true

module Api
  module V1
    module CustomReactions
      class PacksController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: CustomReactionsPackSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :list_custom_reactions?)

          render_json(CustomReactionsPackSerializer, CustomReactionsPack.all(organization: current_organization))
        end

        response code: 204
        request_params do
          {
            name: { type: :string, enum: CustomReaction.packs.keys },
          }
        end
        def create
          authorize(current_organization, :create_custom_reaction?)

          CustomReactionsPack.install!(name: params[:name], organization: current_organization, creator: current_organization_membership)
        end

        response code: 204
        def destroy
          authorize(current_organization, :destroy_custom_reaction?)

          CustomReactionsPack.uninstall!(name: params[:name], organization: current_organization)
        end
      end
    end
  end
end
