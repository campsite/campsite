# frozen_string_literal: true

module Api
  module V1
    module Notes
      class CommentsController < BaseController
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
          authorize(current_note, :list_comments?)

          comments = current_note
            .kept_comments
            .root
            .serializer_preloads

          render_page(CommentPageSerializer, comments, order: :desc)
        end

        response model: CommentCreatedSerializer, code: 201
        request_params do
          Comment::CreateComment::CREATE_COMMENT_REQUEST_PARAMS
        end
        def create
          authorize(current_note, :create_comment?)

          comment = Comment.create_comment(params: params, member: current_organization_membership, subject: current_note)

          if comment.errors.empty?
            render_json(
              CommentCreatedSerializer,
              {
                post_comment: comment,
                preview_commenters: current_note.preview_commenters,
                # reload the attachment to get the latest comment count
                attachment: comment.attachment&.reload,
                attachment_commenters: comment.attachment&.latest_commenters,
              },
              status: :created,
            )
          else
            render_unprocessable_entity(comment)
          end
        end

        private

        def current_note
          @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
