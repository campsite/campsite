# frozen_string_literal: true

module Api
  module V1
    module Posts
      module Attachments
        class ReordersController < PostsBaseController
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
            authorize(current_post, :update?)
            current_post.reorder_attachments(params[:attachments])
          end
        end
      end
    end
  end
end
