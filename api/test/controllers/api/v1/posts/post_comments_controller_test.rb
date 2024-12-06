# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostCommentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_member = create(:organization_membership)
          @user = @user_member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization, member: @user_member)
        end

        context "#index" do
          setup do
            create(:comment, subject: @post)
            create(:comment, subject: @post)
          end

          test "works for org admin" do
            sign_in @user
            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal true, json_response["data"].first["viewer_can_follow_up"]
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member
            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_comments_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "return 403 for an unauthenticated user" do
            get organization_post_comments_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "works for an unauthenticated user when post is public" do
            @post.update!(visibility: "public")

            get organization_post_comments_path(@organization.slug, @post.public_id)
            assert_response :ok
            assert_response_gen_schema
            assert_equal false, json_response["data"].first["viewer_can_follow_up"]
          end

          test "returns comment replies and reactions" do
            sign_in @user
            first_comment = @post.comments.first
            reply = create(:comment, subject: @post, parent_id: first_comment.id)
            reply.reactions.create(member: @user_member, content: "🔥")
            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            json_comment = json_response["data"].find { |c| c["id"] == first_comment.public_id }
            json_reply = json_comment["replies"].find { |c| c["id"] == reply.public_id }
            assert_equal 1, json_reply["grouped_reactions"].length
          end

          test "it returns grouped_reactions in the right order" do
            sign_in @user
            @post.comments.first.reactions.create(member: @user_member, content: "🔥")
            @post.comments.first.reactions.create(member: @user_member, content: "👍")
            @post.comments.first.reactions.create(member: @user_member, content: "❤️")
            second_member = create(:organization_membership, organization: @organization)
            second_member.user.update(name: "Hermione")
            third_member = create(:organization_membership, organization: @organization)
            third_member.user.update(name: "Ron")
            @post.comments.first.reactions.create(member: second_member, content: "❤️")
            @post.comments.first.reactions.create(member: third_member, content: "❤️")

            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "🔥", json_response["data"][1]["grouped_reactions"][0]["emoji"]
            assert_equal "Harry Potter", json_response["data"][1]["grouped_reactions"][0]["tooltip"]
            assert_equal "👍", json_response["data"][1]["grouped_reactions"][1]["emoji"]
            assert_equal "Harry Potter", json_response["data"][1]["grouped_reactions"][1]["tooltip"]
            assert_equal "❤️", json_response["data"][1]["grouped_reactions"][2]["emoji"]
            assert_equal "Harry Potter, Hermione, Ron", json_response["data"][1]["grouped_reactions"][2]["tooltip"]
          end

          test "only returns root comments and not replies" do
            sign_in @user
            first_comment = @post.comments.first
            first_comment.replies.create(member: @user_members, body_html: "<p>reply</p>")

            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["data"].pluck("body_html").include?("reply")
          end

          test "doesn't result in excessive amount of queries" do
            sign_in @user

            create(:comment, member: create(:organization_membership, :with_status, organization: @organization), subject: @post, parent: @post.comments[0])
            create(:comment, member: create(:organization_membership, :with_status, organization: @organization), subject: @post, parent: @post.comments[1])
            create(:comment, member: create(:organization_membership, :with_status, organization: @organization), subject: @post, parent: @post.comments[1])

            @post.comments[0].timeline_events.create(
              action: "comment_referenced_in_external_record",
              reference: create(:external_record, :linear_issue),
            )

            resolved = create(:comment, subject: @post)
            resolved.resolve!(actor: create(:organization_membership, :with_status, organization: @organization))

            assert_query_count 10 do
              get organization_post_comments_path(@organization.slug, @post.public_id)
            end
          end

          test "returns timeline events" do
            sign_in @user

            external_record = create(:external_record, :linear_issue)
            comment = create(:comment, subject: @post)
            comment.timeline_events.create(action: "created_linear_issue_from_comment", reference: external_record)

            get organization_post_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "created_linear_issue_from_comment", json_response["data"][0]["timeline_events"][0]["action"]
          end

          test "returns correct viewer_can_edit permissions for admin" do
            sign_in @user

            post = create(:post, organization: @organization, member: @user_member)
            self_comment = create(:comment, subject: post, member: @user_member)
            other_comment = create(:comment, subject: post)
            integration_comment = create(:comment, :from_integration, subject: post)
            oauth_application_comment = create(:comment, :from_oauth_application, subject: post)

            get organization_post_comments_path(@organization.slug, post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal true, json_response["data"].find { |c| c["id"] == self_comment.public_id }["viewer_can_edit"]
            assert_equal false, json_response["data"].find { |c| c["id"] == other_comment.public_id }["viewer_can_edit"]
            assert_equal true, json_response["data"].find { |c| c["id"] == integration_comment.public_id }["viewer_can_edit"]
            assert_equal true, json_response["data"].find { |c| c["id"] == oauth_application_comment.public_id }["viewer_can_edit"]
          end

          test "returns correct viewer_can_edit permissions for member" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user

            post = create(:post, organization: @organization, member: @user_member)
            self_comment = create(:comment, subject: post, member: member)
            other_comment = create(:comment, subject: post, member: @user_member)
            integration_comment = create(:comment, :from_integration, subject: post)
            oauth_application_comment = create(:comment, :from_oauth_application, subject: post)

            get organization_post_comments_path(@organization.slug, post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal true, json_response["data"].find { |c| c["id"] == self_comment.public_id }["viewer_can_edit"]
            assert_equal false, json_response["data"].find { |c| c["id"] == other_comment.public_id }["viewer_can_edit"]
            assert_equal true, json_response["data"].find { |c| c["id"] == integration_comment.public_id }["viewer_can_edit"]
            assert_equal true, json_response["data"].find { |c| c["id"] == oauth_application_comment.public_id }["viewer_can_edit"]
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            get organization_post_comments_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end

        context "#create" do
          test "works for an org admin" do
            sign_in @user

            assert_difference -> { @post.comments.count } do
              post organization_post_comments_path(@organization.slug, @post.public_id), params: { body_html: "best post ever " }

              assert_response :created
              assert_response_gen_schema
              assert_equal @user, @post.comments.last.user
            end
          end

          test "triggers comments-stale with pusher" do
            sign_in @user

            post organization_post_comments_path(@organization.slug, @post.public_id), params: { body_html: "best post ever " }

            assert_response :created
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "comments-stale", { post_id: @post.public_id, subject_id: @post.public_id, user_id: @user.public_id, attachment_id: nil }.to_json])
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            assert_difference -> { @post.comments.count } do
              post organization_post_comments_path(@organization.slug, @post.public_id), params: { body_html: "best post ever " }

              assert_response :created
              assert_response_gen_schema
              comment = @post.comments.last!
              assert_equal member, comment.user
            end
          end

          context "with file_id" do
            test "creates a comment for the post file" do
              file = create(:attachment, subject: @post)
              member = create(:organization_membership, :member, organization: @organization).user

              sign_in member
              post organization_post_comments_path(@organization.slug, @post.public_id), params: { body_html: "best post ever", file_id: file.public_id }

              assert_response :created
              assert_response_gen_schema
              assert_equal file.public_id, json_response["post_comment"]["attachment_id"]
              assert_equal member, @post.comments.last.user
              assert_equal member, file.comments.last.user
            end

            test "returns attachment with latest comment info" do
              file = create(:attachment, subject: @post)
              member = create(:organization_membership, :member, organization: @organization)

              sign_in member.user
              post organization_post_comments_path(@organization.slug, @post.public_id), params: { body_html: "best post ever", file_id: file.public_id }

              assert_response :created
              assert_response_gen_schema
              assert_equal file.public_id, json_response["post_comment"]["attachment_id"]
              assert_equal 1, json_response["attachment"]["comments_count"]
              assert_equal 1, json_response["attachment_commenters"].length
              assert_equal member.public_id, json_response["attachment_commenters"][0]["id"]
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_post_comments_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_post_comments_path(@organization.slug, @post.public_id)
            assert_response :unauthorized
          end

          test "create a post comment with attachments for an org admin" do
            sign_in @user

            assert_difference -> { Comment.count } do
              post organization_post_comments_path(@organization.slug, @post.public_id),
                params: {
                  body_html: "<p>this is my comment</p>",
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
                }

              post_comment_json = json_response["post_comment"]

              assert_response_gen_schema
              assert_equal "<p>this is my comment</p>", post_comment_json["body_html"]
              assert_equal 1, post_comment_json["attachments"].length
              assert_equal "image/png", post_comment_json["attachments"][0]["file_type"]
              assert_equal "http://campsite-test.imgix.net/path/to/image.png", post_comment_json["attachments"][0]["url"]
            end
          end

          test "create a post comment with just a file and no body" do
            sign_in @user

            assert_difference -> { Comment.count } do
              post organization_post_comments_path(@organization.slug, @post.public_id),
                params: {
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
                }

              post_comment_json = json_response["post_comment"]

              assert_response_gen_schema
              assert_equal "", post_comment_json["body_html"]
              assert_equal 1, post_comment_json["attachments"].length
              assert_equal "image/png", post_comment_json["attachments"][0]["file_type"]
              assert_equal "http://campsite-test.imgix.net/path/to/image.png", post_comment_json["attachments"][0]["url"]
            end
          end

          test "can't create a comment with no body or attachments" do
            sign_in @user

            post organization_post_comments_path(@organization.slug, @post.public_id),
              params: {}

            assert_response :unprocessable_entity
          end

          test "marks feedback request replied if requested" do
            member1 = create(:organization_membership, :member, organization: @organization)
            member2 = create(:organization_membership, :member, organization: @organization)

            feedback1 = create(:post_feedback_request, post: @post, member: member1)
            feedback2 = create(:post_feedback_request, post: @post, member: member2)

            sign_in member1.user

            post organization_post_comments_path(@organization.slug, @post.public_id),
              params: { body_html: "looks good to me" }

            assert_equal true, feedback1.reload.has_replied
            assert_equal false, feedback2.reload.has_replied
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_comments_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
