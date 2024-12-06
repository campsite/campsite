# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class CommentsController < BaseController
          extend Apigen::Controller

          response model: ZapierCommentSerializer, code: 200
          request_params do
            {
              content: { type: :string, required: true },
              post_id: { type: :string, required: false },
              parent_id: { type: :string, required: false },
            }
          end
          def create
            comment = ZapierComment.new(
              post_id: params[:post_id],
              parent_id: params[:parent_id],
              content: params[:content],
              integration: integration,
              organization: current_organization,
              oauth_application: current_oauth_application,
            ).create!

            render_json(ZapierCommentSerializer, comment)
          end
        end
      end
    end
  end
end
