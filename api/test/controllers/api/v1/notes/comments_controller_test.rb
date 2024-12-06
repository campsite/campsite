# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class CommentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @organization = @member.organization
          @project = create(:project, organization: @organization)
        end

        context "#index" do
          setup do
            create(:comment, subject: @note)
            create(:comment, subject: @note)
          end

          test "works for note author" do
            sign_in @member.user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works for viewer permission" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works for editor permission" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "does not work for member not part of the organization" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            get organization_note_comments_path(@organization.slug, @note.public_id)
            assert_response :forbidden
          end

          test "works for project viewer" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works project editor" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "does not work for member not part of private project" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_note_comments_path(@organization.slug, @note.public_id)
            assert_response :forbidden
          end

          test "return 403 for an unauthenticated user" do
            get organization_note_comments_path(@organization.slug, @note.public_id)
            assert_response :unauthorized
          end

          test "returns comment replies and reactions" do
            sign_in @member.user
            first_comment = @note.comments.first
            reply = create(:comment, subject: @note, parent_id: first_comment.id)
            reply.reactions.create(member: @member, content: "🔥")
            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            json_comment = json_response["data"].find { |c| c["id"] == first_comment.public_id }
            json_reply = json_comment["replies"].find { |c| c["id"] == reply.public_id }
            assert_equal 1, json_reply["grouped_reactions"].length
          end

          test "it returns grouped_reactions in the right order" do
            sign_in @member.user
            @note.comments.first.reactions.create(member: @member, content: "🔥")
            @note.comments.first.reactions.create(member: @member, content: "👍")
            @note.comments.first.reactions.create(member: @member, content: "❤️")
            second_member = create(:organization_membership, organization: @organization)
            second_member.user.update(name: "Hermione")
            third_member = create(:organization_membership, organization: @organization)
            third_member.user.update(name: "Ron")
            @note.comments.first.reactions.create(member: second_member, content: "❤️")
            @note.comments.first.reactions.create(member: third_member, content: "❤️")

            get organization_note_comments_path(@organization.slug, @note.public_id)

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
            sign_in @member.user
            first_comment = @note.comments.first
            first_comment.replies.create(member: @members, body_html: "<p>reply</p>")

            get organization_note_comments_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["data"].pluck("body_html").include?("reply")
          end

          test "doesn't result in excessive amount of queries" do
            sign_in @member.user

            create(:comment, subject: @note, parent: @note.comments[0])
            create(:comment, subject: @note, parent: @note.comments[1])
            create(:comment, subject: @note, parent: @note.comments[1])

            resolved = create(:comment, subject: @note)
            resolved.resolve!(actor: create(:organization_membership, organization: @organization))

            assert_query_count 9 do
              get organization_note_comments_path(@organization.slug, @note.public_id)
            end
          end
        end

        context "#create" do
          test "works for note author" do
            sign_in @member.user

            assert_difference -> { @note.comments.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal @member.user, @note.comments.last.user
          end

          test "works for viewer permission" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user

            assert_difference -> { @note.comments.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal other_member.user, @note.comments.last.user
          end

          test "works for editor permission" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user

            assert_difference -> { @note.comments.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal other_member.user, @note.comments.last.user
          end

          test "does not work for member not part of the organization" do
            sign_in create(:organization_membership, :member, organization: @organization).user

            assert_difference -> { @note.comments.count }, 0 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :forbidden
          end

          test "works for project viewer" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            assert_difference -> { @note.comments.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal project_viewer_member.user, @note.comments.last.user
          end

          test "works for project editor" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            assert_difference -> { @note.comments.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever" },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal project_editor_member.user, @note.comments.last.user
          end

          test "does not work for member not part of private project" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :forbidden
          end

          test "triggers comments-stale with pusher" do
            sign_in @member.user

            post organization_note_comments_path(@organization.slug, @note.public_id),
              params: { body_html: "best note ever" },
              as: :json

            assert_response :created
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
              @note.channel_name,
              "comments-stale",
              {
                post_id: @note.public_id,
                subject_id: @note.public_id,
                user_id: @member.user.public_id,
                attachment_id: nil,
              }.to_json,
            ])
          end

          context "with file_id" do
            test "creates a comment for the post file" do
              file = create(:attachment, subject: @note)

              sign_in @member.user
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever", file_id: file.public_id },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal file.public_id, json_response["post_comment"]["attachment_id"]
              assert_equal @member.user, @note.comments.last.user
              assert_equal @member.user, file.comments.last.user
            end

            test "returns attachment with latest comment info" do
              file = create(:attachment, subject: @note)

              sign_in @member.user
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: { body_html: "best note ever", file_id: file.public_id },
                as: :json

              assert_response :created
              assert_response_gen_schema
              assert_equal file.public_id, json_response["post_comment"]["attachment_id"]
              assert_equal 1, json_response["attachment"]["comments_count"]
              assert_equal 1, json_response["attachment_commenters"].length
              assert_equal @member.public_id, json_response["attachment_commenters"][0]["id"]
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_note_comments_path(@organization.slug, @note.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_note_comments_path(@organization.slug, @note.public_id)
            assert_response :unauthorized
          end

          test "create a post comment with attachments for an org admin" do
            sign_in @member.user

            assert_difference -> { Comment.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: {
                  body_html: "<p>this is my comment</p>",
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
                },
                as: :json

              post_comment_json = json_response["post_comment"]

              assert_response_gen_schema
              assert_equal "<p>this is my comment</p>", post_comment_json["body_html"]
              assert_equal 1, post_comment_json["attachments"].length
              assert_equal "image/png", post_comment_json["attachments"][0]["file_type"]
              assert_equal "http://campsite-test.imgix.net/path/to/image.png", post_comment_json["attachments"][0]["url"]
            end
          end

          test "create a post comment with just a file and no body" do
            sign_in @member.user

            assert_difference -> { Comment.count }, 1 do
              post organization_note_comments_path(@organization.slug, @note.public_id),
                params: {
                  attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
                },
                as: :json

              post_comment_json = json_response["post_comment"]

              assert_response_gen_schema
              assert_equal "", post_comment_json["body_html"]
              assert_equal 1, post_comment_json["attachments"].length
              assert_equal "image/png", post_comment_json["attachments"][0]["file_type"]
              assert_equal "http://campsite-test.imgix.net/path/to/image.png", post_comment_json["attachments"][0]["url"]
            end
          end

          test "can't create a comment with no body or attachments" do
            sign_in @member.user

            post organization_note_comments_path(@organization.slug, @note.public_id),
              params: {},
              as: :json

            assert_response :unprocessable_entity
          end
        end
      end
    end
  end
end
