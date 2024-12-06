# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class AttachmentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership, :member)
          @organization = @member.organization
          @post = create(:post, :feedback_requested, organization: @organization, member: @member)
        end

        context "#create" do
          test "post author can add attachments" do
            attachment_name = "my-image.png"
            attachment_size = 1.megabyte
            assert_equal 0, @post.sorted_attachments.count

            sign_in(@member.user)
            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", position: 0, name: attachment_name, size: attachment_size },
              as: :json

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @post.reload.sorted_attachments.count
            assert_not_nil json_response["id"]
            assert_equal attachment_name, json_response["name"]
            assert_equal attachment_size, json_response["size"]
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "invalidate-post", { post_id: @post.public_id }.to_json])
          end

          test "non-author cannot add attachments" do
            @other_member = create(:organization_membership, :member, organization: @organization)

            sign_in(@other_member.user)
            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", position: 0 },
              as: :json

            assert_response :forbidden
          end

          test "attachments can be added out of order" do
            assert_equal 0, @post.sorted_attachments.count

            sign_in(@member.user)

            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", position: 2 },
              as: :json

            assert_equal "/path/to/image1.png", @post.reload.sorted_attachments[0].file_path

            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/gif", file_path: "/path/to/image2.gif", position: 0 },
              as: :json

            assert_equal "/path/to/image2.gif", @post.reload.sorted_attachments[0].file_path
            assert_equal "/path/to/image1.png", @post.reload.sorted_attachments[1].file_path

            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/jpeg", file_path: "/path/to/image3.jpeg", position: 1 },
              as: :json

            assert_equal "/path/to/image2.gif", @post.reload.sorted_attachments[0].file_path
            assert_equal "/path/to/image3.jpeg", @post.reload.sorted_attachments[1].file_path
            assert_equal "/path/to/image1.png", @post.reload.sorted_attachments[2].file_path
          end

          test "attachments can be added in order" do
            assert_equal 0, @post.sorted_attachments.count

            sign_in(@member.user)

            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", position: 0 },
              as: :json

            assert_equal "/path/to/image1.png", @post.reload.sorted_attachments[0].file_path

            post organization_post_attachments_path(@organization.slug, @post.public_id),
              params: { file_type: "image/gif", file_path: "/path/to/image2.gif", position: 1 },
              as: :json

            assert_equal "/path/to/image1.png", @post.reload.sorted_attachments[0].file_path
            assert_equal "/path/to/image2.gif", @post.reload.sorted_attachments[1].file_path
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user

            post organization_post_attachments_path(@organization.slug, post.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", position: 0 },
              as: :json

            assert_response :not_found
          end
        end

        context "#destroy" do
          test "post author can add attachments" do
            attachment = create(:attachment, file_path: "/path/to/image1.png", subject: @post)
            assert_equal 1, @post.reload.sorted_attachments.count

            sign_in(@member.user)
            delete organization_post_attachment_path(@organization.slug, @post.public_id, attachment.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, @post.reload.sorted_attachments.count
          end

          test "non-author cannot add attachments" do
            attachment = create(:attachment, file_path: "/path/to/image1.png", subject: @post)
            assert_equal 1, @post.reload.sorted_attachments.count

            @other_member = create(:organization_membership, :member, organization: @organization)
            sign_in(@other_member.user)
            delete organization_post_attachment_path(@organization.slug, @post.public_id, attachment.public_id)

            assert_response :forbidden
            assert_equal 1, @post.reload.sorted_attachments.count
          end

          test "retries if database deadlocks" do
            attachment = create(:attachment, file_path: "/path/to/image1.png", subject: @post)
            Attachment.any_instance.stubs(:destroy!).raises(ActiveRecord::Deadlocked).then.raises(ActiveRecord::Deadlocked).then.returns(true)

            sign_in(@member.user)
            delete organization_post_attachment_path(@organization.slug, @post.public_id, attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)
            attachment = create(:attachment, subject: post)

            sign_in @member.user

            delete organization_post_attachment_path(@organization.slug, post.public_id, attachment.public_id)

            assert_response :not_found
          end
        end

        context "#update" do
          setup do
            @attachment = create(:attachment, subject: @post)
            @new_preview_file_path = "/path/to/image2.png"
            @new_width = 100
            @new_height = 200
          end

          test "post author can update preview_file_path, width, and height" do
            sign_in @member.user
            put organization_post_attachment_path(@organization.slug, @post.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response["preview_url"], @new_preview_file_path
            assert_equal @new_width, json_response["width"]
            assert_equal @new_height, json_response["height"]
          end

          test "non-author cannot update attachment" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            put organization_post_attachment_path(@organization.slug, @post.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :forbidden
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)
            attachment = create(:attachment, subject: post)

            sign_in @member.user

            put organization_post_attachment_path(@organization.slug, post.public_id, attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :not_found
          end
        end
      end
    end
  end
end
