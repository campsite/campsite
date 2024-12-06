# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Comments
      class RepliesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @comment = create(:comment)
          @member = @comment.member
          @organization = @member.organization
        end

        context "#create" do
          test "works for an org admin" do
            sign_in @member.user

            assert_difference -> { @comment.subject.comments.count } do
              post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal @member.user, @comment.replies.last.user
            assert_equal "<p>my reply</p>", @comment.replies.last.body_html
            assert_equal "<p>my reply</p>", json_response["reply"]["body_html"]
          end

          test "works when post has an attachment" do
            post = create(:post, :with_attachments, organization: @organization, member: @member)
            comment = create(:comment, subject: post, attachment: post.attachments.first)

            sign_in @member.user

            post organization_comment_replies_path(@organization.slug, comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json

            assert_response :created
            assert_response_gen_schema
            assert_equal "<p>my reply</p>", json_response["reply"]["body_html"]
            assert_not_nil json_response["reply"]["attachment_id"]
            assert_equal [post.member.public_id, comment.member.public_id].sort, json_response["attachment_commenters"].pluck("id").sort
            assert_equal 2, json_response["attachment"]["comments_count"]
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            assert_difference -> { @comment.subject.comments.count } do
              post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal member, @comment.subject.comments.last.user
          end

          test "query count" do
            post = create(:post, :with_attachments, organization: @organization, member: @member)
            comment = create(:comment, subject: post, attachment: post.attachments.first)

            sign_in @member.user

            assert_query_count 28 do
              post organization_comment_replies_path(@organization.slug, comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }
            assert_response :unauthorized
          end

          test "create a comment reply with attachments for an org admin" do
            attachment_name = "my-image.png"
            attachment_size = 1.megabyte
            sign_in @member.user

            assert_difference -> { Comment.count } do
              post organization_comment_replies_path(@organization.slug, @comment.public_id),
                params: {
                  body_html: "<p>my reply</p>",
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png", name: attachment_name, size: attachment_size }],
                },
                as: :json
            end

            assert_response_gen_schema
            assert_equal "<p>my reply</p>", json_response["reply"]["body_html"]
            assert_equal 1, json_response["reply"]["attachments"].length
            assert_equal "image/png", json_response["reply"]["attachments"][0]["file_type"]
            assert_equal "http://campsite-test.imgix.net/path/to/image.png", json_response["reply"]["attachments"][0]["url"]
            assert_equal attachment_name, json_response["reply"]["attachments"][0]["name"]
            assert_equal attachment_size, json_response["reply"]["attachments"][0]["size"]
          end

          test "create a comment reply with just a file and no body" do
            sign_in @member.user

            assert_difference -> { Comment.count } do
              post organization_comment_replies_path(@organization.slug, @comment.public_id),
                params: {
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
                },
                as: :json
            end

            assert_response_gen_schema
            assert_equal "", json_response["reply"]["body_html"]
            assert_equal 1, json_response["reply"]["attachments"].length
            assert_equal "image/png", json_response["reply"]["attachments"][0]["file_type"]
            assert_equal "http://campsite-test.imgix.net/path/to/image.png", json_response["reply"]["attachments"][0]["url"]
          end

          test "can't create a comment reply without body and attachments" do
            sign_in @member.user

            post organization_comment_replies_path(@organization.slug, @comment.public_id),
              params: {},
              as: :json

            assert_response :unprocessable_entity
          end

          test "marks feedback request replied if requested" do
            member1 = create(:organization_membership, :member, organization: @organization)
            member2 = create(:organization_membership, :member, organization: @organization)

            feedback1 = create(:post_feedback_request, post: @comment.subject, member: member1)
            feedback2 = create(:post_feedback_request, post: @comment.subject, member: member2)

            sign_in member1.user

            post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json

            assert_equal true, feedback1.reload.has_replied
            assert_equal false, feedback2.reload.has_replied
          end

          test "stores reply body in created event metadata" do
            sign_in @member.user

            post organization_comment_replies_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my reply</p>" }, as: :json

            assert_response :created
            assert_response_gen_schema
            reply = @comment.subject.comments.last!
            created_event = reply.events.created_action.first!
            assert_equal reply.body_html, created_event.subject_previous_changes[reply.mentionable_attribute].last
          end
        end
      end
    end
  end
end
