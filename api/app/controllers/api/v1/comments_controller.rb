# frozen_string_literal: true

module Api
  module V1
    class CommentsController < BaseController
      extend Apigen::Controller

      response model: CommentSerializer, code: 200
      def show
        authorize(current_comment, :show?)

        render_json(CommentSerializer, current_comment)
      end

      response model: CommentSerializer, code: 200
      request_params do
        {
          body_html: { type: :string, nullable: true },
        }
      end
      def update
        authorize(current_comment, :update?)

        current_comment.body_html = params[:body_html] if params.key?(:body_html)

        if params.key?(:attachment_ids)
          current_comment.attachments = Attachment.in_order_of(:public_id, params[:attachment_ids])

          ids_and_positions = params[:attachment_ids].map { |id| { id: id, position: params[:attachment_ids].index(id) } }
          current_comment.reorder_attachments(ids_and_positions)
        end

        if current_comment.save
          render_json(CommentSerializer, current_comment)
        else
          render_unprocessable_entity(current_comment)
        end
      end

      response model: CommentersSerializer, code: 200
      def destroy
        authorize(current_comment, :destroy?)

        current_comment.discard_by_actor(current_organization_membership)

        render_json(CommentersSerializer, current_comment.subject.preview_commenters, status: :ok)
      end

      private

      def current_comment
        @current_comment ||= Comment.serializer_preloads.kept.find_by!(public_id: params[:id])
      end
    end
  end
end
