# frozen_string_literal: true

module Api
  module V1
    class AttachmentsController < BaseController
      extend Apigen::Controller

      skip_before_action :require_authenticated_user, only: :show
      skip_before_action :require_org_two_factor_authentication, only: :show
      skip_before_action :require_authenticated_organization_membership, only: :show

      CREATE_PARAMS = {
        figma_file_id: { type: :integer, required: false, nullable: true },
        file_path: { type: :string },
        file_type: { type: :string },

        imgix_video_file_path: { type: :string, required: false },
        name: { type: :string, required: false, nullable: true },
        preview_file_path: { type: :string, required: false, nullable: true },

        figma_share_url: { type: :string, required: false },
        remote_figma_node_id: { type: :string, required: false, nullable: true },
        remote_figma_node_name: { type: :string, required: false, nullable: true },
        remote_figma_node_type: { type: :string, required: false, nullable: true },

        duration: { type: :number, required: false },
        size: { type: :number, required: false, nullable: true },
        height: { type: :number, required: false },
        width: { type: :number, required: false },
        no_video_track: { type: :boolean, required: false },
        gallery_id: { type: :string, required: false, nullable: true },
      }.freeze

      response model: AttachmentSerializer, code: 201
      request_params do
        CREATE_PARAMS
      end
      def create
        authorize(current_organization, :create_attachments?)

        attachment = Attachment.create!(params.permit(CREATE_PARAMS.keys))
        render_json(AttachmentSerializer, attachment, status: :created)
      end

      response model: AttachmentSerializer, code: 200
      def show
        attachment = Attachment.find_by!(public_id: params[:id])

        authorize(attachment, :show?)

        render_json(AttachmentSerializer, attachment)
      end
    end
  end
end
