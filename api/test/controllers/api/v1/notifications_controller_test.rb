# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class NotificationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#index" do
        before do
          @user_member = create(:organization_membership)
          @organization = @user_member.organization
          @user = @user_member.user
        end

        test "returns latest notification for a target for the current user" do
          post = create(:post, :resolved, organization: @organization, member: @user_member)

          newer_comment = create(:comment, subject: post, body_html: "<p>Hello, world!</p>")
          newer_comment.events.first!.process!

          Timecop.travel(5.minutes.ago) do
            older_comment = create(:comment, subject: post)
            older_comment.events.first!.process!
          end

          sign_in(@user)

          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["data"].length
          result_notification = json_response["data"].first
          assert_equal newer_comment.notifications.first!.public_id, result_notification["id"]
          assert_equal "Harry Potter commented on #{post.title}", result_notification["summary"]
          assert_equal "Hello, world!", result_notification["body_preview"]
          assert_equal @organization.slug, result_notification["organization_slug"]
          assert_equal post.public_id, result_notification.dig("target", "id")
          assert_equal true, result_notification.dig("target", "resolved")
          assert_equal post.project.name, result_notification.dig("target", "project", "name")
          assert_equal newer_comment.public_id, result_notification.dig("subject", "id")
        end

        test "excludes archived notifications" do
          post = create(:post, organization: @organization, member: @user_member)
          newer_comment = create(:comment, subject: post, body_html: "<p>Hello, world!</p>")
          newer_comment.events.first!.process!
          notification = newer_comment.notifications.first!
          notification.archive!

          sign_in(@user)
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 0, json_response["data"].length
        end

        test "doesn't result in excessive amount of queries" do
          post = create(:post, organization: @organization, member: @user_member)

          newer_comment = create(:comment, subject: post)
          newer_comment.events.first!.process!

          Timecop.travel(5.minutes.ago) do
            older_comment = create(:comment, subject: post)
            older_comment.events.first!.process!
          end

          reaction_post = create(:post, organization: @organization, member: @user_member)
          create_list(:reaction, 3, subject: reaction_post).each { |r| r.events.first!.process! }

          reaction_post2 = create(:post, organization: @organization, member: @user_member)
          create_list(:reaction, 3, subject: reaction_post2).each { |r| r.events.first!.process! }

          custom_reaction_post = create(:post, organization: @organization, member: @user_member)
          create_list(:reaction, 3, :custom_content, subject: custom_reaction_post).each { |r| r.events.first!.process! }

          custom_reaction_post2 = create(:post, organization: @organization, member: @user_member)
          create_list(:reaction, 3, :custom_content, subject: custom_reaction_post2).each { |r| r.events.first!.process! }

          comment = create(:comment, member: @user_member)
          create_list(:reaction, 3, subject: comment).each { |r| r.events.first!.process! }

          post = create(:post, organization: @organization, member: @user_member)
          create_list(:post_feedback_request, 2, post: post).each { |r| r.events.first!.process! }

          note = create(:note, member: create(:organization_membership, organization: @organization))
          permission = create(:permission, user: @user_member.user, subject: note, action: :view)
          permission.events.created_action.first!.process!

          mention_post = create(:post, organization: @organization, description_html: MentionsFormatter.format_mention(@user_member))
          mention_post.events.first!.process!

          call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: call, organization_membership: @user_member)
          call.update!(generated_title_status: :completed, generated_summary_status: :completed)
          call.events.updated_action.last!.process!

          call2 = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: call2, organization_membership: @user_member)
          call2.update!(generated_title_status: :completed, generated_summary_status: :completed)
          call2.events.updated_action.last!.process!

          project = create(:project, organization: @organization)
          create(:user_subscription, user: @user, subscribable: project)
          project_post = create(:post, organization: @organization, project: project)
          project_post.events.first!.process!

          parent = create(:post, organization: @organization)
          create(:user_subscription, user: @user, subscribable: parent)
          iteration_post = create(:post, parent: parent, member: parent.member, organization: @organization)
          iteration_post.events.created_action.first!.process!

          parent2 = create(:post, organization: @organization)
          create(:user_subscription, user: @user, subscribable: parent2)
          iteration_post2 = create(:post, parent: parent2, member: parent2.member, organization: @organization)
          iteration_post2.events.created_action.first!.process!

          attachments_post = create(:post, :with_attachments, organization: @organization)
          canvas_comment = create(:comment, subject: attachments_post, attachment: attachments_post.attachments.first, x: 100, y: 100)
          canvas_comment.events.first!.process!
          canvas_comment_follow_up = create(:follow_up, subject: canvas_comment, organization_membership: @user_member)
          canvas_comment_follow_up.show!
          canvas_comment_follow_up.events.updated_action.first!.process!

          mention_comment_post = create(:post, :with_attachments, organization: @organization)
          create(:comment, body_html: MentionsFormatter.format_mention(@user_member), subject: mention_comment_post)
            .events.first!.process!

          comment_reaction_post1 = create(:post, :with_attachments, organization: @organization)
          comment_reaction1 = create(:comment, member: @user_member, subject: comment_reaction_post1)
          create(:reaction, subject: comment_reaction1).events.first!.process!

          comment_reaction_post2 = create(:post, :with_attachments, organization: @organization)
          comment_reaction2 = create(:comment, member: @user_member, subject: comment_reaction_post2)
          create(:reaction, :custom_content, subject: comment_reaction2).events.first!.process!

          comment_custom_reaction_post1 = create(:post, :with_attachments, organization: @organization)
          comment_custom_reaction1 = create(:comment, member: @user_member, subject: comment_custom_reaction_post1)
          create(:reaction, subject: comment_custom_reaction1).events.first!.process!

          comment_custom_reaction_post2 = create(:post, :with_attachments, organization: @organization)
          comment_custom_reaction2 = create(:comment, member: @user_member, subject: comment_custom_reaction_post2)
          create(:reaction, :custom_content, subject: comment_custom_reaction2).events.first!.process!

          post_follow_up = create(:follow_up, subject: post, organization_membership: @user_member)
          post_follow_up.show!
          post_follow_up.events.updated_action.first!.process!

          comment_follow_up = create(:follow_up, subject: newer_comment, organization_membership: @user_member)
          comment_follow_up.show!
          comment_follow_up.events.updated_action.first!.process!

          note_follow_up = create(:follow_up, subject: note, organization_membership: @user_member)
          note_follow_up.show!
          note_follow_up.events.updated_action.first!.process!

          call_follow_up = create(:follow_up, subject: call, organization_membership: @user_member)
          call_follow_up.show!
          call_follow_up.events.updated_action.first!.process!

          sign_in(@user)

          assert_query_count 38 do
            get organization_notifications_path(@organization)
          end
        end

        test "separates reaction notifications on same target" do
          post = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post)
          comment.events.first!.process!
          reaction = create(:reaction, subject: post)
          reaction.events.first!.process!

          sign_in(@user)
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 2, json_response["data"].length
          assert_equal "#{reaction.member.display_name} reacted #{reaction.content} to your post", json_response["data"][0]["summary"]
          assert_equal "#{comment.member.display_name} commented on #{post.title}", json_response["data"][1]["summary"]
        end

        test "can include reactions on comments with poly subjects" do
          post = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post, member: @user_member, body_html: "<p>Hello, world!</p>")
          comment.events.first!.process!
          reaction = create(:reaction, subject: comment)
          reaction.events.first!.process!

          sign_in(@user)
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema
          result_reaction_notification = json_response["data"].find { |n| n.dig("subject", "id") == reaction.public_id }
          assert_equal "Hello, world!", result_reaction_notification["reply_to_body_preview"]
        end

        test "follow up subject renders correctly on follow up notification" do
          post = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post, body_html: "<p>Hello, world!</p>")
          comment.events.first!.process!
          follow_up = create(:follow_up, subject: comment, organization_membership: @user_member)

          sign_in(@user)
          get organization_notifications_path(@organization)
          assert_equal json_response["data"][0]["follow_up_subject"]["id"], comment.public_id
          assert_equal json_response["data"][0]["follow_up_subject"]["viewer_follow_up"]["id"], follow_up.public_id

          follow_up.show!
          get organization_notifications_path(@organization)
          assert_equal json_response["data"][0]["follow_up_subject"]["id"], comment.public_id
          assert_nil json_response["data"][0]["follow_up_subject"]["viewer_follow_up"]
        end

        test "follow up subject renders correctly on reaction notification" do
          post = create(:post, organization: @organization, member: @user_member)
          reaction = create(:reaction, subject: post)
          reaction.events.first!.process!
          follow_up = create(:follow_up, subject: post, organization_membership: @user_member)

          sign_in(@user)
          get organization_notifications_path(@organization)
          assert_equal json_response["data"][0]["follow_up_subject"]["id"], post.public_id
          assert_equal json_response["data"][0]["follow_up_subject"]["viewer_follow_up"]["id"], follow_up.public_id

          follow_up.show!
          get organization_notifications_path(@organization)
          assert_equal json_response["data"][0]["follow_up_subject"]["id"], post.public_id
          assert_nil json_response["data"][0]["follow_up_subject"]["viewer_follow_up"]
        end

        test "renders call processed notification" do
          call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: call, organization_membership: @user_member)
          call.update!(generated_title_status: :completed, generated_summary_status: :completed)
          call.events.updated_action.last!.process!

          sign_in(@user)
          get organization_notifications_path(@organization)

          notification_response = json_response["data"][0]
          assert_equal "Your call summary is ready", notification_response["summary"]
          assert_equal call.public_id, notification_response.dig("follow_up_subject", "id"), call.public_id
          assert_equal "Call", notification_response.dig("follow_up_subject", "type")
        end

        test "includes reply_to_body_content for replies" do
          post = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post, member: @user_member, body_html: "<p>This is the parent!</p>")
          reply = create(:comment, subject: post, body_html: "<p>This is the reply!</p>", parent: comment)
          reply.events.first!.process!

          sign_in comment.member.user
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema
          result_notification = json_response["data"].first
          assert_equal "This is the parent!", result_notification["reply_to_body_preview"]
          assert_equal "This is the reply!", result_notification["body_preview"]
        end

        test "returns a mix of read and unread notifications" do
          post1 = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post1)
          comment.events.first!.process!

          post2 = create(:post, organization: @organization, member: @user_member)
          reaction = create(:reaction, subject: post2)
          event = reaction.events.first!
          event.process!

          event.notifications.mark_all_read

          sign_in(@user)

          get organization_notifications_path(@organization), params: { unread: false }

          assert_response :ok
          assert_response_gen_schema

          assert_equal 2, json_response["data"].length
          assert_equal true, json_response["data"][0]["read"]
          assert_equal false, json_response["data"][1]["read"]
        end

        test "returns a mix of read and unread notifications" do
          post1 = create(:post, organization: @organization, member: @user_member)
          comment = create(:comment, subject: post1)
          comment.events.first!.process!

          post2 = create(:post, organization: @organization, member: @user_member)
          reaction = create(:reaction, subject: post2)
          event = reaction.events.first!
          event.process!

          event.notifications.mark_all_read

          sign_in(@user)

          get organization_notifications_path(@organization), params: { unread: true }

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["data"].length
          assert_equal false, json_response["data"][0]["read"]
        end

        test "returns reaction content for reaction notifications" do
          post = create(:post, organization: @organization, member: @user_member)
          reaction = create(:reaction, subject: post)
          reaction.events.first!.process!

          sign_in(@user)
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["data"].length
          assert_equal reaction.content, json_response["data"][0]["reaction"]["content"]
        end

        test "returns reaction custom content for custom reaction notifications" do
          post = create(:post, organization: @organization, member: @user_member)
          custom_reaction = create(:reaction, :custom_content, subject: post)
          custom_reaction.events.first!.process!

          sign_in(@user)
          get organization_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["data"].length
          assert_equal custom_reaction.custom_content.name, json_response["data"][0]["reaction"]["custom_content"]["name"]
          assert_equal custom_reaction.custom_content.file_url, json_response["data"][0]["reaction"]["custom_content"]["file_url"]
        end

        context "#home" do
          test "returns notifications with preload state" do
            post = create(:post, organization: @organization, member: @user_member)
            create(:comment, subject: post).events.first!.process!

            # should not appear in home notifications
            resolved_comment = create(:comment, subject: post)
            resolved_comment.resolve!(actor: create(:organization_membership, organization: @organization))
            resolved_comment.events.first!.process!

            assert post.subscribed?(@user)

            sign_in(@user)
            get organization_notifications_path(@organization), params: { filter: "home" }

            assert_response :ok
            assert_response_gen_schema

            assert_equal 1, json_response["data"].length
            assert_equal post.public_id, json_response["data"][0]["target"]["id"]
            assert_not_nil json_response["data"][0]["summary"]
          end
        end

        context "#grouped_home" do
          test "separates notifications on the same target" do
            post = create(:post, :resolved, organization: @organization, member: @user_member)

            older_comment = create(:comment, subject: post)
            older_comment.events.first!.process!

            newer_comment = create(:comment, subject: post, body_html: "<p>Hello, world!</p>")
            newer_comment.events.first!.process!

            sign_in(@user)

            get organization_notifications_path(@organization), params: { filter: "grouped_home" }

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response["data"].length
            assert_equal newer_comment.public_id, json_response["data"][0]["subject"]["id"]
            assert_equal older_comment.public_id, json_response["data"][1]["subject"]["id"]
          end
        end

        context "#activity" do
          test "returns notifications with preload state" do
            post = create(:post, organization: @organization, member: @user_member)
            create(:comment, subject: post).events.first!.process!

            create_list(:reaction, 3, subject: post).each { |r| r.events.first!.process! }

            assert post.subscribed?(@user)

            sign_in(@user)
            get organization_notifications_path(@organization), params: { filter: "activity" }

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response["data"].length
            assert_equal ["Reaction"], json_response["data"].map { |n| n["subject"]["type"] }.uniq
          end
        end
      end

      context "#destroy" do
        before do
          @notified_member = create(:organization_membership)
          @notification = create(:notification, organization_membership: @notified_member)
        end

        test "notified user can archive a notification" do
          sign_in(@notified_member.user)

          delete organization_notification_path(@notified_member.organization, @notification.public_id)

          assert_response :no_content
          assert_predicate @notification.reload, :archived?
        end

        test "deleting a notification archives older notifications for the same user and target" do
          other_notification = create(:notification, organization_membership: @notified_member, target: @notification.target)
          sign_in(@notified_member.user)

          delete organization_notification_path(@notified_member.organization, @notification.public_id)

          assert_response :no_content
          assert_predicate @notification.reload, :archived?
          assert_predicate other_notification.reload, :archived?
        end

        test "deleting a notification with order_by 'target' archives all notifications for the same target" do
          other_notification = create(:notification, organization_membership: @notified_member, target: @notification.target)
          sign_in(@notified_member.user)

          delete organization_notification_path(@notified_member.organization, @notification.public_id), params: { archive_by: "target" }

          assert_response :no_content
          assert_predicate @notification.reload, :archived?
          assert_predicate other_notification.reload, :archived?
        end

        test "deleting a notification with order_by 'id' archives only that notification" do
          other_notification = create(:notification, organization_membership: @notified_member, target: @notification.target)
          sign_in(@notified_member.user)

          delete organization_notification_path(@notified_member.organization, @notification.public_id), params: { archive_by: "id" }

          assert_response :no_content
          assert_predicate @notification.reload, :archived?
          assert_not_predicate other_notification.reload, :archived?
        end

        test "returns 404 when notification has already been archived" do
          @notification.update!(archived_at: Time.current)

          sign_in(@notified_member.user)
          delete organization_notification_path(@notified_member.organization, @notification.public_id)

          assert_response :not_found
        end

        test "returns 403 for random user" do
          sign_in(create(:user))

          delete organization_notification_path(@notified_member.organization, @notification.public_id)

          assert_response :forbidden
          assert_not_predicate @notification.reload, :archived?
        end

        test "returns 422 for invalid archive_by value" do
          sign_in(@notified_member.user)

          delete organization_notification_path(@notified_member.organization, @notification.public_id), params: { archive_by: "invalid" }

          assert_response :unprocessable_entity
          assert_not_predicate @notification.reload, :archived?
        end
      end
    end
  end
end
