# frozen_string_literal: true

module Api
  module V1
    class PostNoteOpenGraphImagesController < BaseController
      skip_before_action :require_authenticated_user, only: :show
      skip_before_action :require_authenticated_organization_membership, only: :show

      WIDTH = 600
      HEIGHT = 315

      def show
        title_html = if current_post.title.present?
          <<~HTML.squish
            <h1 style="margin-bottom: 16px; font-size: 150%;">#{current_post.title}</h1>
          HTML
        end

        html = <<~HTML.squish
          <div style="padding: 32px; background-color: white">
            #{title_html}
            #{current_post.mailer_description_html}
          </div>
          <div style="position: fixed; bottom: 0; left: 0; right:0; top: #{HEIGHT / 2}px; background-image: linear-gradient(to top, #fff, transparent, transparent);"></div>
        HTML

        # Renders a 1200x630 (recommended size for Open Graph images) image at 2x zoom (looks good for our descriptions).
        # https://iamturns.com/open-graph-image-size/
        png = html_to_image_client.image(html: html, width: WIDTH, height: HEIGHT, device_scale_factor: 2)

        send_data(png, type: "image/png", disposition: "inline", transparent: true)
      end

      private

      def html_to_image_client
        @html_to_image_client ||= HtmlToImage.new
      end

      def current_post
        @current_post ||= Post.find_by!(public_id: params[:post_id])
      end
    end
  end
end
