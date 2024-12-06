# frozen_string_literal: true

module Api
  module V1
    module Notes
      class ThumbnailsController < BaseController
        skip_before_action :require_authenticated_user, only: :show
        skip_before_action :require_authenticated_organization_membership, only: :show

        def show
          png = html_to_image_client.image(
            html: current_note.mailer_description_html,
            theme: params[:theme] || "light",
            width: params[:width].to_i || 700,
          )

          send_data(png, type: "image/png", disposition: "inline", transparent: true)
        end

        private

        def html_to_image_client
          @html_to_image_client ||= HtmlToImage.new
        end

        def current_note
          @current_note ||= Note.find_by!(public_id: params[:note_id])
        end
      end
    end
  end
end
