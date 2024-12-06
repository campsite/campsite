# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PostNoteOpenGraphImagesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#show" do
        before do
          @post = create(:post, description_html: "<p>Test</p>")
        end

        test "it returns an Open Graph image for a post with a note" do
          expected_html = <<~HTML.squish
            <div style="padding: 32px; background-color: white">
              <h1 style="margin-bottom: 16px; font-size: 150%;">#{@post.title}</h1>
              #{@post.mailer_description_html}
            </div>
            <div style="position: fixed; bottom: 0; left: 0; right:0; top: 157px; background-image: linear-gradient(to top, #fff, transparent, transparent);"></div>
          HTML

          HtmlToImage.any_instance.expects(:image).with(html: expected_html, width: 600, height: 315, device_scale_factor: 2)

          get post_note_open_graph_image_path(@post.public_id, @post.contents_hash)

          assert_response :ok
        end

        test "it returns a 404 if post ID is invalid" do
          HtmlToImage.any_instance.expects(:image).never

          get post_note_open_graph_image_path("not-a-post-id", @post.contents_hash)

          assert_response :not_found
        end
      end
    end
  end
end
