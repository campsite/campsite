# frozen_string_literal: true

module Api
  module V1
    module Comments
      module Attachments
        class ReordersController < BaseController
          extend Apigen::Controller

          response code: 204
          request_params do
            {
              attachments: {
                type: :object,
                is_array: true,
                properties: {
                  id: { type: :string },
                  position: { type: :number },
                },
              },
            }
          end
          def update
            authorize(current_comment, :update?)
            current_comment.reorder_attachments(params[:attachments])
          end

          private

          def current_comment
            @current_comment ||= Comment.kept.find_by!(public_id: params[:comment_id])
          end
        end
      end
    end
  end
end
