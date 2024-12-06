# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class FigmaFileAttachmentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          member = create(:organization_membership)
          @user = member.user
          @integration = create(:integration, provider: :figma, owner: @user)
          @organization = member.organization
          @post = create(:post, member: member, organization: @organization)
          @file_key = "foobar"
          @node_id = "1:2"
          @figma_file_url = "https://www.figma.com/design/#{CGI.escape(@file_key)}/file-name?node-id=#{CGI.escape(@node_id)}"
          @file_name = "file name"
          @node_name = "node name"
          @node_type = "FRAME"
          @figma_image_url = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/#{SecureRandom.uuid}"
          @width = 200
          @height = 100
          @size = 1000
        end

        describe "#create" do
          test "returns attachment details" do
            FigmaClient.any_instance.expects(:file_nodes).with(file_key: @file_key, node_ids: [@node_id]).returns(
              ::Figma::FileNodes.new(
                "name" => @file_name,
                "nodes" => {
                  @node_id => {
                    "document" => {
                      "id" => @node_id,
                      "name" => @node_name,
                      "type" => @node_type,
                    },
                  },
                },
              ),
            )
            FigmaClient.any_instance.expects(:image).with(file_key: @file_key, node_id: @node_id, scale: 2, format: "png").returns(@figma_image_url)
            Down.expects(:download).returns(stub(content_type: "image/png", size: @size))
            FastImage.expects(:size).returns([@width, @height])
            S3_BUCKET.expects(:object).returns(stub(put: true))

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug), params: { figma_file_url: @figma_file_url }

            assert_response :created
            assert_response_gen_schema
            assert_equal "image/png", json_response["file_type"]
            assert_equal @width, json_response["width"]
            assert_equal @height, json_response["height"]
            assert_equal @size, json_response["size"]
            assert_equal @node_name, json_response["remote_figma_node_name"]
            assert_equal @node_type, json_response["remote_figma_node_type"]
            assert_equal @figma_file_url, json_response["figma_share_url"]
          end

          test "returns attachment details when URL doesn't contain a node ID" do
            figma_file_url = "https://www.figma.com/file/#{CGI.escape(@file_key)}/file-name"

            FigmaClient.any_instance.expects(:file).with(@file_key).returns(
              ::Figma::File.new(
                "name" => @file_name,
                "document" => {
                  "children" => [
                    "id" => @node_id,
                    "name" => @node_name,
                    "type" => @node_type,
                  ],
                },
              ),
            )
            FigmaClient.any_instance.expects(:image).with(file_key: @file_key, node_id: @node_id, scale: 2, format: "png").returns(@figma_image_url)
            Down.expects(:download).returns(stub(content_type: "image/png", size: @size))
            FastImage.expects(:size).returns([@width, @height])
            S3_BUCKET.expects(:object).returns(stub(put: true))

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: figma_file_url }

            assert_response :created
            assert_response_gen_schema
            assert_equal "image/png", json_response["file_type"]
          end

          test "returns attachment details from URL for a prototype" do
            figma_proto_url = "https://www.figma.com/proto/#{CGI.escape(@file_key)}/file-name?node-id=#{CGI.escape(@node_id)}"

            FigmaClient.any_instance.expects(:file_nodes).with(file_key: @file_key, node_ids: [@node_id]).returns(
              ::Figma::FileNodes.new(
                "name" => @file_name,
                "nodes" => {
                  @node_id => {
                    "document" => {
                      "id" => @node_id,
                      "name" => @node_name,
                      "type" => @node_type,
                    },
                  },
                },
              ),
            )
            FigmaClient.any_instance.expects(:image).with(file_key: @file_key, node_id: @node_id, scale: 2, format: "png").returns(@figma_image_url)
            Down.expects(:download).returns(stub(content_type: "image/png", size: @size))
            FastImage.expects(:size).returns([@width, @height])
            S3_BUCKET.expects(:object).returns(stub(put: true))

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: figma_proto_url }

            assert_response :created
            assert_response_gen_schema
            assert_equal "image/png", json_response["file_type"]
            assert_equal figma_proto_url, json_response["figma_share_url"]
          end

          test "works with legacy file URLs" do
            figma_file_url = "https://www.figma.com/file/#{CGI.escape(@file_key)}/file-name?node-id=#{CGI.escape(@node_id)}"

            FigmaClient.any_instance.expects(:file_nodes).with(file_key: @file_key, node_ids: [@node_id]).returns(
              ::Figma::FileNodes.new(
                "name" => @file_name,
                "nodes" => {
                  @node_id => {
                    "document" => {
                      "id" => @node_id,
                      "name" => @node_name,
                      "type" => @node_type,
                    },
                  },
                },
              ),
            )
            FigmaClient.any_instance.expects(:image).with(file_key: @file_key, node_id: @node_id, scale: 2, format: "png").returns(@figma_image_url)
            Down.expects(:download).returns(stub(content_type: "image/png", size: @size))
            FastImage.expects(:size).returns([@width, @height])
            S3_BUCKET.expects(:object).returns(stub(put: true))

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: figma_file_url }

            assert_response :created
            assert_response_gen_schema
            assert_equal "image/png", json_response["file_type"]
            assert_equal figma_file_url, json_response["figma_share_url"]
          end

          test "returns an error when user not connected to Figma" do
            FigmaClient.any_instance.expects(:file_nodes).never
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            @integration.destroy!

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: @figma_file_url }

            assert_response :unprocessable_entity
          end

          test "gracefully handles a malformed URL" do
            FigmaClient.any_instance.expects(:file_nodes).never
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: {
              figma_file_url: "https://www.figma.com/proto/AGuvGJzAmspEbP3fenH5vi/Layer?page-id=1%3A198435&type=de…aling=min-zoom&starting-point-node-id=1133%3A88105&mode=design",
            }

            assert_response :unprocessable_entity
          end

          test "gracefully handles a Figma API timeout" do
            FigmaClient.any_instance.expects(:file_nodes).raises(Faraday::TimeoutError.new("Net::ReadTimeout with #<TCPSocket:(closed)>"))
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: @figma_file_url }

            assert_response :unprocessable_entity
          end

          test "returns an error when user does not have access to Figma file" do
            FigmaClient.any_instance.expects(:file_nodes).raises(FigmaClient::ForbiddenError.new("You don't have access to this file"))
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: @figma_file_url }

            assert_response :forbidden
          end

          test "returns an error to a rando" do
            FigmaClient.any_instance.expects(:file_nodes).never
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            sign_in create(:user)
            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: @figma_file_url }

            assert_response :forbidden
          end

          test "returns an error to an unauthenticated user" do
            FigmaClient.any_instance.expects(:file_nodes).never
            FigmaClient.any_instance.expects(:image).never
            Down.expects(:download).never
            FastImage.expects(:size).never
            S3_BUCKET.expects(:object).never

            post organization_figma_file_attachment_details_path(@organization.slug, @post.public_id), params: { figma_file_url: @figma_file_url }

            assert_response :unauthorized
          end

          test "refreshes expired OAuth token" do
            FigmaClient::Oauth.any_instance.expects(:refresh_token).returns("access_token" => "new_token", "expires_in" => 60 * 60 * 24 * 90)
            FigmaClient.any_instance.expects(:file_nodes).with(file_key: @file_key, node_ids: [@node_id]).returns(
              ::Figma::FileNodes.new(
                "name" => @file_name,
                "nodes" => {
                  @node_id => {
                    "document" => {
                      "id" => @node_id,
                      "name" => @node_name,
                      "type" => @node_type,
                    },
                  },
                },
              ),
            )
            FigmaClient.any_instance.expects(:image).with(file_key: @file_key, node_id: @node_id, scale: 2, format: "png").returns(@figma_image_url)
            Down.expects(:download).returns(stub(content_type: "image/png", size: @size))
            FastImage.expects(:size).returns([@width, @height])
            S3_BUCKET.expects(:object).returns(stub(put: true))

            @integration.update!(token_expires_at: 1.day.ago)

            sign_in @user
            post organization_figma_file_attachment_details_path(@organization.slug), params: { figma_file_url: @figma_file_url }

            assert_response :created
            assert_response_gen_schema
            assert_equal "image/png", json_response["file_type"]
            assert_equal @width, json_response["width"]
            assert_equal @height, json_response["height"]
            assert_equal @size, json_response["size"]
            assert_equal @node_name, json_response["remote_figma_node_name"]
            assert_equal @node_type, json_response["remote_figma_node_type"]
            assert_equal @figma_file_url, json_response["figma_share_url"]
          end
        end
      end
    end
  end
end
