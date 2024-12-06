# frozen_string_literal: true

module Api
  module V1
    class CustomReactionsController < BaseController
      extend Apigen::Controller

      after_action :verify_authorized
      after_action :verify_policy_scoped, only: :index

      response model: CustomReactionPageSerializer, code: 200
      request_params do
        {
          after: { type: :string, required: false },
          limit: { type: :number, required: false },
        }
      end
      def index
        authorize(current_organization, :list_custom_reactions?)

        render_page(CustomReactionPageSerializer, policy_scope(current_organization.custom_reactions.eager_load(creator: OrganizationMembership::SERIALIZER_EAGER_LOAD)), { order: :desc })
      end

      response model: CustomReactionSerializer, code: 201
      request_params do
        {
          name: { type: :string },
          file_path: { type: :string },
          file_type: { type: :string },
        }
      end
      def create
        authorize(current_organization, :create_custom_reaction?)

        custom_reaction = current_organization.custom_reactions.create!(
          name: params[:name],
          file_path: params[:file_path],
          file_type: params[:file_type],
          creator: current_organization_membership,
        )

        render_json(CustomReactionSerializer, custom_reaction, status: :created)
      end

      response code: 204
      def destroy
        authorize(current_organization, :destroy_custom_reaction?)

        current_custom_reaction.destroy!
      end

      private

      def current_custom_reaction
        @current_custom_reaction ||= current_organization.custom_reactions.find_by!(public_id: params[:id])
      end
    end
  end
end
