# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Posts
      module Attachments
        class CommentsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @post = create(:post)
            @member = @post.member
            @org = @member.organization
            @attachments = [
              create(:attachment, subject: @post),
              create(:attachment, subject: @post),
            ]
          end

          context "#index" do
            test "returns only comments on attachment" do
              comment11 = create(:comment, subject: @post, attachment: @attachments[0])
              comment12 = create(:comment, subject: @post, attachment: @attachments[0])
              comment21 = create(:comment, subject: @post, attachment: @attachments[1])

              sign_in @member.user

              get organization_post_attachment_comments_path(@org.slug, @post.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [comment11, comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort

              get organization_post_attachment_comments_path(@org.slug, @post.public_id, @attachments[1].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal comment21.public_id, json_response["data"].first["id"]
            end

            test "returns 404 for draft post" do
              post = create(:post, :draft, organization: @org)
              attachment = create(:attachment, subject: post)

              sign_in @member.user

              get organization_post_attachment_comments_path(@org.slug, post.public_id, attachment.public_id)

              assert_response :not_found
            end
          end
        end
      end
    end
  end
end
