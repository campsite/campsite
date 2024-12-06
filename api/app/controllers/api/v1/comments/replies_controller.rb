# frozen_string_literal: true

module Api
  module V1
    module Comments
      class RepliesController < BaseController
        extend Apigen::Controller

        response model: ReplyCreatedSerializer, code: 201
        request_params do
          {
            body_html: { type: :string, nullable: true },
            attachments: {
              type: :object,
              is_array: true,
              required: false,
              properties: {
                file_path: { type: :string },
                file_type: { type: :string },
                preview_file_path: { type: :string, required: false, nullable: true },
                name: { type: :string, required: false, nullable: true },
                size: { type: :number, required: false, nullable: true },
              },
            },
          }
        end
        def create
          authorize(current_comment.subject, :create_comment?)

          reply = Comment.create_comment(params: params, member: current_organization_membership, parent: current_comment)

          if reply.errors.empty?
            render_json(
              ReplyCreatedSerializer,
              {
                reply: reply,
                # reload the attachment to get the latest comment count
                attachment: reply.attachment&.reload,
                attachment_commenters: reply.attachment&.latest_commenters,
              },
              status: :created,
            )
          else
            render_unprocessable_entity(reply)
          end
        end

        private

        def current_comment
          @current_comment ||= Comment.kept.find_by!(public_id: params[:comment_id])
        end
      end
    end
  end
end
