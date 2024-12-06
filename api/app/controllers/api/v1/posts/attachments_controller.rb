# frozen_string_literal: true

module Api
  module V1
    module Posts
      class AttachmentsController < PostsBaseController
        extend Apigen::Controller

        around_action :retry_deadlock, only: :destroy

        CREATE_PARAMS_WITH_POSITION = Api::V1::AttachmentsController::CREATE_PARAMS.merge(position: { type: :number }).freeze

        response model: AttachmentSerializer, code: 201
        request_params do
          CREATE_PARAMS_WITH_POSITION
        end
        def create
          authorize(current_post, :update?)
          attachment = current_post.attachments.create!(params.permit(CREATE_PARAMS_WITH_POSITION.keys))
          render_json(AttachmentSerializer, attachment, status: :created)
        end

        response model: AttachmentSerializer, code: 200
        request_params do
          {
            preview_file_path: { type: :string, required: false },
            width: { type: :number, required: false },
            height: { type: :number, required: false },
          }
        end
        def update
          authorize(current_post, :update?)

          attachment = current_post.attachments.find_by!(public_id: params[:id])

          if params.key?(:preview_file_path)
            attachment.preview_file_path = params[:preview_file_path]
          end

          if params.key?(:width)
            attachment.width = params[:width]
          end

          if params.key?(:height)
            attachment.height = params[:height]
          end

          attachment.save!

          render_json(AttachmentSerializer, attachment, status: :ok)
        end

        response model: PostSerializer, code: 200
        def destroy
          authorize(current_post, :update?)
          current_post.attachments.find_by!(public_id: params[:id]).destroy!
          render_json(PostSerializer, current_post, status: :ok)
        end
      end
    end
  end
end
