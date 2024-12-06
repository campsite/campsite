# frozen_string_literal: true

module Api
  module V1
    module Notes
      module Attachments
        class CommentsController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_user, only: :index
          skip_before_action :require_authenticated_organization_membership, only: :index
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
              .where(attachment: current_attachment)
              .serializer_preloads

            render_page(CommentPageSerializer, comments, order: :desc)
          end

          private

          def current_note
            @current_note ||= current_organization.notes.kept.find_by!(public_id: params[:note_id])
          end

          def current_attachment
            @current_attachment ||= current_note.attachments.find_by!(public_id: params[:attachment_id])
          end
        end
      end
    end
  end
end
