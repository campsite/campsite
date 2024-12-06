# frozen_string_literal: true

module Api
  module V1
    module Posts
      module Attachments
        class CommentsController < PostsBaseController
          extend Apigen::Controller

          after_action :verify_authorized

          response model: CommentPageSerializer, code: 200
          request_params do
            {
              after: { type: :string, required: false },
              limit: { type: :number, required: false },
            }
          end
          def index
            authorize(current_post, :list_comments?)

            comments = current_post
              .kept_comments
              .root
              .where(attachment: current_attachment)
              .serializer_preloads

            render_page(CommentPageSerializer, comments, order: :desc)
          end

          private

          def current_attachment
            @current_attachment ||= current_post.attachments.find_by!(public_id: params[:attachment_id])
          end
        end
      end
    end
  end
end
