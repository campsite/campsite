# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class CommentsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        post = create(:post)
        @comment = create(:comment, subject: post, member: create(:organization_membership, :member, organization: post.organization))
        @member = @comment.member
        @organization = @member.organization
        @admin = create(:organization_membership, :admin, organization: @member.organization)
      end

      context "#show" do
        test "works for an org admin" do
          sign_in create(:organization_membership, :admin, organization: @member.organization).user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_resolve"]
          assert_equal true, json_response["viewer_can_create_issue"]
          assert_equal true, json_response["viewer_can_follow_up"]
        end

        test "works for org member" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_resolve"]
          assert_equal true, json_response["viewer_can_create_issue"]
          assert_equal true, json_response["viewer_can_follow_up"]
        end

        test "works for guest" do
          guest_member = create(:organization_membership, :guest, organization: @organization)
          @comment.subject.project.add_member!(guest_member)

          sign_in guest_member.user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_resolve"]
          assert_equal false, json_response["viewer_can_create_issue"]
          assert_equal true, json_response["viewer_can_follow_up"]
        end

        test "works for the comment creator" do
          sign_in @comment.user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema
        end

        test "includes unshown follow ups" do
          unshown_follow_up = create(:follow_up, subject: @comment)
          create(:follow_up, :shown, subject: @comment)

          sign_in @comment.user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_equal [unshown_follow_up.public_id], json_response["follow_ups"].pluck("id")
        end

        test "query count" do
          sign_in create(:organization_membership, :admin, organization: @member.organization).user

          assert_query_count 9 do
            get organization_comment_path(@organization.slug, @comment.public_id)
          end
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_comment_path(@organization.slug, @comment.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_comment_path(@organization.slug, @comment.public_id)
          assert_response :unauthorized
        end

        test "includes resource mentions" do
          mentioned_post = create(:post, organization: @organization)

          mentioned_note = create(:note, member: create(:organization_membership, organization: @organization))
          open_project = create(:project, organization: @organization)
          mentioned_note.add_to_project!(project: open_project)

          mentioned_call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: mentioned_call, organization_membership: @member)

          html = <<~HTML.strip
            <resource-mention href="https://app.campsite.com/campsite/posts/#{mentioned_post.public_id}"></resource-mention>
            <resource-mention href="https://app.campsite.com/campsite/notes/#{mentioned_note.public_id}"></resource-mention>
            <resource-mention href="https://app.campsite.com/campsite/calls/#{mentioned_call.public_id}"></resource-mention>
          HTML

          @comment.update!(body_html: html)

          sign_in @member.user
          get organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [mentioned_post.public_id], json_response["resource_mentions"].map { |mention| mention.dig("post", "id") }.compact
          assert_equal [mentioned_note.public_id], json_response["resource_mentions"].map { |mention| mention.dig("note", "id") }.compact
          assert_equal [mentioned_call.public_id], json_response["resource_mentions"].map { |mention| mention.dig("call", "id") }.compact
        end
      end

      context "#update" do
        test "handles changes to attachments" do
          attachment = create(:attachment)

          sign_in @member.user

          # add 1 attachment to a comment without any
          put organization_comment_path(@organization.slug, @comment.public_id),
            params: {
              body_html: "<p>update my comment</p>",
              attachment_ids: [attachment.public_id],
            },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal @comment.attachments.pluck(:public_id), [attachment.public_id]

          new_attachments = create_list(:attachment, 2, subject: nil)

          # replace the original attachment with 2 new attachments
          put organization_comment_path(@organization.slug, @comment.public_id),
            params: {
              body_html: "<p>update my comment</p>",
              attachment_ids: new_attachments.map(&:public_id),
            },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal @comment.attachments.pluck(:public_id), new_attachments.map(&:public_id)

          # remove all attachments
          put organization_comment_path(@organization.slug, @comment.public_id),
            params: {
              body_html: "<p>update my comment</p>",
              attachment_ids: [],
            },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal @comment.attachments.pluck(:public_id), []
        end

        test "works for comment creator" do
          sign_in @member.user
          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "<p>update my comment</p>", json_response["body_html"]
        end

        test "allows member to edit oauth application comments" do
          sign_in @member.user

          comment = create(:comment, :from_oauth_application, subject: @comment.subject)

          put organization_comment_path(@organization.slug, comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "<p>update my comment</p>", json_response["body_html"]
        end

        test "allows member to edit integration comments" do
          sign_in @member.user

          comment = create(:comment, :from_integration, subject: @comment.subject)

          put organization_comment_path(@organization.slug, comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "<p>update my comment</p>", json_response["body_html"]
        end

        test "triggers comments-stale with pusher" do
          sign_in @member.user

          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json

          assert_response :ok
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @comment.subject.channel_name,
            "comments-stale",
            { post_id: @comment.subject.public_id, subject_id: @comment.subject.public_id, user_id: @member.user.public_id, attachment_id: nil }.to_json,
          ])
        end

        test "manages attachment position" do
          attachments = create_list(:attachment, 3)

          sign_in @member.user

          # initial order
          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>my comment</p>", attachment_ids: attachments.map(&:public_id) }, as: :json

          assert_response :ok
          assert_equal [0, 1, 2], @comment.attachments.in_order_of(:id, attachments.pluck(:id)).pluck(:position)

          # same attachments with a new order
          put organization_comment_path(@organization.slug, @comment.public_id), params: { attachment_ids: attachments.map(&:public_id).reverse }, as: :json

          assert_response :ok
          assert_equal [2, 1, 0], @comment.attachments.in_order_of(:id, attachments.pluck(:id)).pluck(:position)
        end

        test "query count" do
          sign_in @member.user

          assert_query_count 15 do
            put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json
          end
        end

        test "returns a 403 for an org admin" do
          sign_in create(:organization_membership, :admin, organization: @member.organization).user

          assert_no_difference -> { @comment.subject.comments.count } do
            put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json
          end
          assert_response :forbidden
        end

        test "returns a 403 for other org members" do
          sign_in create(:organization_membership, organization: @organization).user
          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_comment_path(@organization.slug, @comment.public_id), params: { body_html: "<p>update my comment</p>" }, as: :json
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        test "works for comment creator" do
          sign_in @member.user

          assert_difference -> { @comment.subject.kept_comments.count }, -1 do
            delete organization_comment_path(@organization.slug, @comment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @member, @comment.events.destroyed_action.first.actor
          end
        end

        test "triggers comments-stale with pusher" do
          sign_in @member.user

          delete organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @comment.subject.channel_name,
            "comments-stale",
            { post_id: @comment.subject.public_id, subject_id: @comment.subject.public_id, user_id: @member.user.public_id, attachment_id: nil }.to_json,
          ])
        end

        test "works for an org admin" do
          sign_in @admin.user

          assert_difference -> { @comment.subject.kept_comments.count }, -1 do
            delete organization_comment_path(@organization.slug, @comment.public_id)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @admin, @comment.events.destroyed_action.first.actor
        end

        test "allows member to delete oauth application comments" do
          sign_in @member.user

          comment = create(:comment, :from_oauth_application, subject: @comment.subject)

          assert_difference -> { comment.subject.kept_comments.count }, -1 do
            delete organization_comment_path(@organization.slug, comment.public_id)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @member, comment.events.destroyed_action.first.actor
        end

        test "allows member to delete integration comments" do
          sign_in @member.user

          comment = create(:comment, :from_integration, subject: @comment.subject)

          assert_difference -> { @comment.subject.kept_comments.count }, -1 do
            delete organization_comment_path(@organization.slug, comment.public_id)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @member, comment.events.destroyed_action.first.actor
        end

        test "discards all reactions and replies" do
          reaction = create(:reaction, subject: @comment)
          reply = create(:comment, parent: @comment)

          sign_in @member.user
          delete organization_comment_path(@organization.slug, @comment.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_predicate @comment.reload, :discarded?
          assert_predicate reaction.reload, :discarded?
          assert_predicate reply.reload, :discarded?
        end

        test "query count" do
          create(:reaction, subject: @comment)
          create(:comment, parent: @comment)

          sign_in @member.user

          assert_query_count 42 do
            delete organization_comment_path(@organization.slug, @comment.public_id)
          end
        end

        test "returns a 403 for other org members" do
          user = create(:organization_membership, :member, organization: @organization).user

          sign_in user
          delete organization_comment_path(@organization.slug, @comment.public_id)
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          delete organization_comment_path(@organization.slug, @comment.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_comment_path(@organization.slug, @comment.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
