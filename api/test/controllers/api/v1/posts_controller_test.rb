# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"
require "test_helpers/rack_attack_helper"

module Api
  module V1
    class PostsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers
      include OauthTestHelper
      include RackAttackHelper

      def create_token(user:, provider:)
        app = @user.oauth_applications.find_or_create_by(
          name: provider,
          provider: provider,
          redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
          confidential: true,
          scopes: "read_organization write_post write_project",
        )

        access_token = app.access_tokens.build(
          resource_owner: @user,
          expires_in: Doorkeeper.configuration.access_token_expires_in.to_i,
          scopes: app.scopes,
        )
        access_token.use_refresh_token = true
        access_token.save!

        access_token
      end

      setup do
        @organization = create(:organization)
        @member = create(:organization_membership, organization: @organization)
        @user = @member.user
        @project = create(:project, organization: @organization)
        @general_project = create(:project, :general, organization: @organization)
      end

      context "#index" do
        before do
          @post = create(:post, :with_links, :with_attachments, :with_reactions, :with_tags, :with_viewers, :with_poll, organization: @organization)
          @other_post = create(:post, :with_links, :with_attachments, :with_reactions, :with_tags, :with_viewers, :with_poll, organization: @organization)
          @reacted_post = create(:post, :with_reactions, organization: @organization, parent: create(:post, organization: @organization))
        end

        test "orders posts by recent activity" do
          @post.update!(published_at: 1.month.ago, last_activity_at: 1.hour.ago)
          @other_post.update!(published_at: 2.days.ago, last_activity_at: 2.days.ago)
          @reacted_post.update!(published_at: 1.day.ago, last_activity_at: 1.day.ago)

          sign_in @user
          get organization_posts_path(@organization.slug, params: { order: { by: "last_activity_at", direction: "desc" } })

          assert_response :ok
          assert_response_gen_schema
          assert_equal [@post, @reacted_post, @other_post].map(&:public_id), json_response["data"].pluck("id")
        end

        test "orders posts by published date" do
          @post.update!(published_at: 1.month.ago, last_activity_at: 1.hour.ago)
          @other_post.update!(published_at: 2.days.ago, last_activity_at: 2.days.ago)
          @reacted_post.update!(published_at: 1.day.ago, last_activity_at: 1.day.ago)

          sign_in @user
          get organization_posts_path(@organization.slug, params: { order: { by: "published_at", direction: "desc" } })

          assert_response :ok
          assert_response_gen_schema
          assert_equal [@reacted_post, @other_post, @post].map(&:public_id), json_response["data"].pluck("id")
        end

        test("it includes grouped_reactions in the right order") do
          sign_in @user
          other_member = create(:organization_membership, user: create(:user, name: "Hermione"))
          create(:reaction, subject: @post, member: @member, content: "❤️")
          create(:reaction, subject: @post, member: @member, content: "️👍")
          create(:reaction, subject: @post, member: other_member, content: "️👍")
          create(:reaction, subject: @post, member: other_member, content: "❤️")
          create(:reaction, subject: @post, member: other_member, content: "🔥")

          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          test_post_response = json_response["data"].find { |post| post["id"] == @post.public_id }
          assert_equal 3, test_post_response["grouped_reactions"].length

          first_reaction = test_post_response["grouped_reactions"][0]
          assert_equal "🔥", first_reaction["emoji"]
          assert_equal "Harry Potter, Hermione", first_reaction["tooltip"]

          second_reaction = test_post_response["grouped_reactions"][1]
          assert_equal "❤️", second_reaction["emoji"]
          assert_equal "Harry Potter, Hermione", second_reaction["tooltip"]
        end

        test("it includes empty grouped_reactions when there are none") do
          sign_in @user

          create(:post, organization: @organization)

          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          test_post_response = json_response["data"][0]
          assert_equal 0, test_post_response["grouped_reactions"].length
        end

        test("it includes preview commenters") do
          other_member = create(:organization_membership, organization: @organization)

          create_list(:comment, 2, subject: @post, member: @member)
          create_list(:comment, 2, subject: @post, member: other_member)

          create_list(:comment, 3, subject: @other_post)
          create(:comment, subject: @other_post, member: @member)
          create(:comment, subject: @other_post, member: other_member)
          oauth_app_comment = create(:comment, :from_oauth_application, subject: @other_post)

          sign_in @user

          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          post_response = json_response["data"].find { |post| post["id"] == @post.public_id }
          assert_equal 2, post_response["preview_commenters"]["latest_commenters"].length
          assert_equal [other_member, @member].pluck(:public_id), post_response["preview_commenters"]["latest_commenters"].pluck("id")

          other_post_response = json_response["data"].find { |post| post["id"] == @other_post.public_id }
          assert_equal 3, other_post_response["preview_commenters"]["latest_commenters"].length
          assert_equal [oauth_app_comment.oauth_application, other_member.user, @member.user].pluck(:public_id), other_post_response["preview_commenters"]["latest_commenters"].map { |c| c["user"]["id"] }
        end

        test "includes viewer_has_subscribed for a post the user has subscribed to" do
          @post.subscriptions.create(user: @user)
          sign_in @user

          get organization_posts_path(@organization.slug)

          post_response = json_response["data"].find { |post| post["id"] == @post.public_id }
          other_post_response = json_response["data"].find { |post| post["id"] == @other_post.public_id }
          assert post_response["viewer_has_subscribed"]
          assert_not other_post_response["viewer_has_subscribed"]
        end

        test "includes latest non-discarded version of a post" do
          iteration = create(:post, parent: @post, organization: @organization)
          iteration.discard

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          post_response = json_response["data"].find { |post| post["id"] == @post.public_id }
          assert_equal @post.description_html, post_response["description_html"]
          assert_nil json_response["data"].find { |post| post["id"] == iteration.public_id }
        end

        test "returns paginated posts for an admin" do
          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 3, json_response["data"].length
        end

        test "returns paginated posts for a member" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 3, json_response["data"].length
        end

        test "includes posts in private projects the user is a member of" do
          project = create(:project, organization: @organization, private: true)
          post = create(:post, organization: @organization, project: project)
          create(:project_membership, organization_membership: @member, project: project)

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_includes json_response["data"].pluck("id"), post.public_id
        end

        test "excludes posts in private projects the user is not a member of" do
          project = create(:project, organization: @organization, private: true)
          post = create(:post, organization: @organization, project: project)

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_not_includes json_response["data"].pluck("id"), post.public_id
        end

        test "excludes posts in projects a guest is not a member of" do
          member = create(:organization_membership, :guest, organization: @organization)
          accessible_project = create(:project, organization: @organization)
          create(:project_membership, organization_membership: member, project: accessible_project)
          accessible_post = create(:post, organization: @organization, project: accessible_project)
          inaccessible_project = create(:project, organization: @organization)
          inaccessible_post = create(:post, organization: @organization, project: inaccessible_project)

          sign_in member.user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 1, json_response["data"].length
          assert_includes json_response["data"].pluck("id"), accessible_post.public_id
          assert_not_includes json_response["data"].pluck("id"), inaccessible_post.public_id
        end

        test "includes polls and options the viewer has voted for" do
          poll = @post.poll
          option = poll.options.first!
          create(:poll_vote, poll_option: option, member: @member)

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          poll_response = json_response["data"].find { |p| p["id"] == @post.public_id }["poll"]
          option_response = poll_response["options"].find { |o| o["id"] == option.public_id }
          assert poll_response["viewer_voted"]
          assert option_response["viewer_voted"]
        end

        test "includes unseen comment counts" do
          # create the view before new comments are created
          create(:post_view, :read, post: @post, member: @member)
          create(:comment, subject: @post)
          create(:comment, subject: @post, member: @member)

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          post_response = json_response["data"].find { |post| post["id"] == @post.public_id }
          assert_equal 1, post_response["unseen_comments_count"]
        end

        test "returns search results" do
          @post.update!(title: "Needle in a haystack")
          @other_post.update!(description_html: "<p>This post has a needle in it</p>")

          Post.reindex

          sign_in @user
          get organization_posts_path(@organization.slug, params: { order: { by: "last_activity_at", direction: "desc" }, q: "needle" })

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_includes json_response["data"].pluck("id"), @post.public_id
          assert_includes json_response["data"].pluck("id"), @other_post.public_id
        end

        test "authorizes rack-mini-profiler for staff user" do
          staff = create(:organization_membership, organization: @organization, user: create(:user, :staff)).user
          Rack::MiniProfiler.expects(:authorize_request).once

          sign_in staff
          get organization_posts_path(@organization.slug)

          assert_response :ok
        end

        test "does not authorize rack-mini-profiler for non-staff user" do
          Rack::MiniProfiler.expects(:authorize_request).never

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_posts_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_posts_path(@organization.slug)
          assert_response :unauthorized
        end

        test "doesn't result in excessive amount of queries" do
          sign_in @user
          assert_query_count 14 do
            get organization_posts_path(@organization.slug)
          end

          assert_response :ok
        end

        test "doesn't return drafts" do
          draft_post = create(:post, :draft, organization: @organization, member: @member)

          sign_in @user
          get organization_posts_path(@organization.slug)

          assert_response :ok
          assert_equal 3, json_response["data"].length
          assert_not_includes json_response["data"].pluck("id"), draft_post.public_id
        end
      end

      context "#create" do
        test "create a post with attachments and links for an org admin" do
          unfurled_link = "https://twitter.com/mattwensing/status/1753422780723318814"
          image_attachment = create(:attachment, subject: nil)
          video_attachment = create(:attachment, :video, subject: nil)

          description_html = <<~HTML.strip
            <p>checkout my new work</p>
            <p><post-attachment id="#{image_attachment.public_id}" file_type="image/png" width="1920" height="1080"></post-attachment></p>
            <p><post-attachment id="#{video_attachment.public_id}" file_type="video/mp4" width="320" height="480"></post-attachment></p>
          HTML

          sign_in @user

          assert_difference -> { @general_project.posts.count } do
            post organization_posts_path(@organization.slug),
              params: {
                title: "My new post",
                description_html: description_html,
                attachment_ids: [image_attachment.public_id, video_attachment.public_id],
                links: [{ name: "Example", url: "https://example.com" }],
                unfurled_link: unfurled_link,
              }

            assert_response_gen_schema
            assert_equal "My new post", json_response["title"]
            assert_equal description_html, json_response["description_html"]
            assert_equal 2, json_response["attachments"].length

            assert_equal image_attachment.file_type, json_response["attachments"][0]["file_type"]
            assert_equal image_attachment.url, json_response["attachments"][0]["url"]

            assert_equal video_attachment.file_type, json_response["attachments"][1]["file_type"]
            assert_equal video_attachment.url, json_response["attachments"][1]["url"]

            assert_equal unfurled_link, json_response["unfurled_link"]

            assert_equal 1, json_response["links"].length
            assert_equal "Example", json_response["links"][0]["name"]
            assert_equal "https://example.com", json_response["links"][0]["url"]

            assert_equal @general_project.public_id, json_response["project"]["id"]
          end
        end

        test "create a post with attachments and links for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user
          image_attachment = create(:attachment, subject: nil)

          description_html = <<~HTML.strip
            <p>checkout my new work</p>
            <p><post-attachment id="#{image_attachment.public_id}" file_type="image/png" width="1920" height="1080"></post-attachment></p>
          HTML

          sign_in org_member

          assert_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                title: "My new post",
                description_html: description_html,
                attachment_ids: [image_attachment.public_id],
                links: [{ name: "Example", url: "https://example.com" }],
              }

            assert_response_gen_schema
            assert_equal "My new post", json_response["title"]
            assert_equal description_html, json_response["description_html"]
            assert_equal 1, json_response["attachments"].length
            assert_equal image_attachment.file_type, json_response["attachments"][0]["file_type"]
            assert_equal image_attachment.url, json_response["attachments"][0]["url"]

            assert_equal 1, json_response["links"].length
            assert_equal "Example", json_response["links"][0]["name"]
            assert_equal "https://example.com", json_response["links"][0]["url"]

            assert_equal @general_project.public_id, json_response["project"]["id"]
          end
        end

        test "creates a post for a project" do
          sign_in @user

          assert_difference -> { @project.posts.count } do
            post organization_posts_path(@organization.slug),
              params: {
                project_id: @project.public_id,
                title: "My new post",
                description_html: "<p>checkout my new work</p>",
              }

            assert_response_gen_schema
            assert_equal "My new post", json_response["title"]
            assert_equal "<p>checkout my new work</p>", json_response["description_html"]
            assert_equal @project.public_id, json_response["project"]["id"]
          end
        end

        test "creates a post with tags" do
          tags = create_list(:tag, 2, organization: @organization)
          sign_in @user

          assert_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                description_html: "<p>checkout my new work</p>",
                tags: tags.map(&:name),
              }

            assert_response :created
            assert_response_gen_schema
            assert_equal "<p>checkout my new work</p>", json_response["description_html"]
            assert_equal 2, json_response["tags"].length
          end
        end

        test "post with tags notifies a mentioned member" do
          mentioned_member = create(:organization_membership, :member, organization: @organization)
          tags = create_list(:tag, 2, organization: @organization)
          sign_in @user

          post organization_posts_path(@organization.slug),
            params: {
              description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>",
              tags: tags.map(&:name),
            },
            as: :json

          assert_response :created
          assert_response_gen_schema
          post = Post.last!
          event = post.events.created_action.first!
          event.process!
          assert_predicate event.notifications.mention.where(organization_membership: mentioned_member), :one?
        end

        test "creates a post with a parent and dismisses parent's pending feedback requests" do
          parent = create(:post, organization: @organization)
          pending_feedback = create(:post_feedback_request, post: parent)
          replied_feedback = create(:post_feedback_request, post: parent, has_replied: true)

          sign_in @user

          assert_difference -> { parent.descendants.count } do
            post organization_posts_path(@organization.slug),
              params: {
                description_html: "<p>checkout my new work</p>",
                parent_id: parent.public_id,
              }

            assert_response_gen_schema
            assert_equal "<p>checkout my new work</p>", json_response["description_html"]
            assert_equal 2, json_response["version"]
            assert_equal true, json_response["has_parent"]
            assert_equal false, json_response["has_iterations"]
            assert_predicate pending_feedback.reload, :discarded?
            assert_not_predicate replied_feedback.reload, :discarded?
          end
        end

        test "creates a post with a poll" do
          sign_in @user

          post organization_posts_path(@organization.slug),
            params: {
              poll: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              },
            }

          assert_response_gen_schema
          assert_equal "best sport", json_response["poll"]["description"]
          assert_equal 2, json_response["poll"]["options"].length
          assert_equal false, json_response["poll"]["viewer_voted"]
        end

        test "creates a post with existing attachments" do
          attachments = create_list(:attachment, 3, subject: nil)

          sign_in @user

          post organization_posts_path(@organization.slug),
            params: {
              title: "My new post",
              description_html: "<p>checkout my new work</p>",
              attachment_ids: attachments.map(&:public_id),
            }

          assert_response :created
          assert_response_gen_schema

          assert_equal 3, json_response["attachments"].length
          assert_equal attachments.map(&:public_id), json_response["attachments"].pluck("id")
        end

        test "creates a post with feedback requests" do
          sign_in @user

          member1 = create(:organization_membership, :member, organization: @organization)
          member2 = create(:organization_membership, :member, organization: @organization)

          post organization_posts_path(@organization.slug),
            params: {
              description_html: "<p>checkout my new work</p>",
              feedback_request_member_ids: [member1.public_id, member2.public_id],
            }

          assert_response_gen_schema
          assert_equal 2, json_response["feedback_requests"].length
          assert_equal [member1.public_id, member2.public_id], json_response["feedback_requests"].pluck("member").pluck("id")
        end

        test "notifies a mentioned org member" do
          mentioned_member = create(:organization_membership, :member, organization: @organization)

          sign_in @user
          post organization_posts_path(@organization.slug),
            params: { description_html: MentionsFormatter.format_mention(mentioned_member) },
            as: :json

          post = Post.last!
          event = post.events.created_action.first!
          event.process!
          assert_predicate event.notifications.mention.where(organization_membership: mentioned_member), :one?
        end

        test "create a post with feedback_requested status" do
          sign_in @user

          assert_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                title: "My new post",
                status: "feedback_requested",
              }
          end

          assert_response :created
          assert_response_gen_schema
          assert_equal "My new post", json_response["title"]
          assert_equal "feedback_requested", json_response["status"]
        end

        test "returns an error for invalid status" do
          sign_in @user

          assert_no_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                title: "My new post",
                status: "not-a-status",
              }
          end

          assert_response :unprocessable_entity
        end

        test "guest can create a post in a project they belong to" do
          project = create(:project, organization: @organization)
          guest_member = create(:organization_membership, :guest, organization: @organization)
          project.add_member!(guest_member)

          sign_in guest_member.user
          post organization_posts_path(@organization.slug),
            params: { title: "My new post", project_id: project.public_id }

          assert_response :created
          assert_response_gen_schema
        end

        test "guest cannot create post in a project they don't belong to" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          post organization_posts_path(@organization.slug),
            params: { title: "My new post" }

          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          post organization_posts_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_posts_path(@organization.slug)
          assert_response :unauthorized
        end

        test "create html if none provided" do
          sign_in @user

          post organization_posts_path(@organization.slug),
            params: {
              description_html: "This is some *markdown*",
              title: "Foo Bar",
            }

          assert_response :created
          assert_response_gen_schema

          post = Post.last
          assert_equal json_response["id"], post.public_id
          assert_not_nil post.description_html
        end

        test "creates a post from a message" do
          project = create(:project, organization: @organization)
          sender = create(:organization_membership, organization: @organization)
          thread = create(:message_thread, :dm, owner: @member)
          message = create(:message, message_thread: thread, sender: sender)

          sign_in @user

          assert_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                description_html: "<p>checkout my new work</p>",
                from_message_id: message.public_id,
                project_id: project.public_id,
              }

            assert_response :created
            assert_response_gen_schema

            post = Post.last
            assert_equal message, post.from_message
          end
        end

        test "creates a post as draft" do
          sign_in @user

          assert_difference -> { Post.count } do
            post organization_posts_path(@organization.slug),
              params: {
                description_html: "<p>this is a description</p>",
                draft: true,
              }

            assert_response :created
            assert_response_gen_schema

            post = Post.last
            assert_equal "draft", post.workflow_state
          end
        end
      end

      context "#show" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @post = create(:post, :with_viewers, organization: @organization, member: @author_member)
        end

        test "works for an org admin" do
          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @post.public_id, json_response["id"]
          assert_equal true, json_response["viewer_can_resolve"]
          assert_equal true, json_response["viewer_can_create_issue"]
        end

        test "doesn't result in excessive amount of queries" do
          sign_in @user
          assert_query_count 14 do
            get organization_post_path(@organization.slug, @post.public_id)
          end

          assert_response :ok
        end

        test "works for the post creator" do
          sign_in @author_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @post.public_id, json_response["id"]
        end

        test "works for other org members" do
          other_member = create(:organization_membership, organization: @organization)

          sign_in other_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @post.public_id, json_response["id"]
        end

        test "returns heirarchy information for a root post" do
          create(:post, organization: @organization, parent: @post)

          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["has_parent"]
          assert_equal true, json_response["has_iterations"]
        end

        test "returns heirarchy information for a iteration post" do
          iteration = create(:post, organization: @organization, parent: @post)

          sign_in @user
          get organization_post_path(@organization.slug, iteration.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["has_parent"]
          assert_equal false, json_response["has_iterations"]
        end

        test "returns total view count" do
          create_list(:post_view, 10, :read, post: @post)

          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 13, json_response["views_count"]
        end

        test "includes status" do
          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_equal json_response["status"], "none"
        end

        test "includes unshown follow ups" do
          my_unshown_follow_up = create(:follow_up, subject: @post, organization_membership: @member)
          other_unshown_follow_up = create(:follow_up, subject: @post)
          create(:follow_up, :shown, subject: @post)

          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_equal 2, json_response["follow_ups"].count
          my_unshown_follow_up_response = json_response["follow_ups"].find { |fu| fu["id"] == my_unshown_follow_up.public_id }
          assert_equal true, my_unshown_follow_up_response["belongs_to_viewer"]
          other_unshown_follow_up_response = json_response["follow_ups"].find { |fu| fu["id"] == other_unshown_follow_up.public_id }
          assert_equal false, other_unshown_follow_up_response["belongs_to_viewer"]
        end

        test "includes viewer_has_favorited true when viewer has favorited" do
          @post.favorites.create!(organization_membership: @author_member)

          sign_in @author_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_has_favorited"]
        end

        test "includes viewer_has_favorited false when viewer has not favorited" do
          sign_in @author_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_has_favorited"]
        end

        test "guest can view post in project they're added to" do
          member = create(:organization_membership, :guest, organization: @organization)
          project = create(:project, organization: @organization)
          create(:project_membership, organization_membership: member, project: project)
          post = create(:post, organization: @organization, project: project)

          sign_in member.user
          get organization_post_path(@organization.slug, post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_resolve"]
          assert_equal false, json_response["viewer_can_create_issue"]
        end

        test "guest can't view post in project they're not added to" do
          member = create(:organization_membership, :guest, organization: @organization)

          sign_in member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :forbidden
        end

        test "includes info about latest comment" do
          comment = create(:comment, subject: @post, member: @author_member)

          sign_in @author_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal comment.post_preview_text, json_response["latest_comment_preview"]
          assert_equal comment.path, json_response["latest_comment_path"]
          assert_equal true, json_response["viewer_is_latest_comment_author"]
        end

        test "post author can edit the post" do
          sign_in @author_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_equal true, json_response["viewer_can_edit"]
        end

        test "non-author cannot edit the post" do
          other_member = create(:organization_membership, organization: @organization)
          sign_in other_member.user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_equal false, json_response["viewer_can_edit"]
        end

        test "admin can edit a post from an integration" do
          post = create(:post, :from_integration, organization: @organization)
          sign_in @user
          get organization_post_path(@organization.slug, post.public_id)

          assert_response :ok
          assert_equal true, json_response["viewer_can_edit"]
        end

        test "member can edit a post from an integration" do
          other_member = create(:organization_membership, :member, organization: @organization)
          post = create(:post, :from_integration, organization: @organization)
          sign_in other_member.user
          get organization_post_path(@organization.slug, post.public_id)

          assert_response :ok
          assert_equal true, json_response["viewer_can_edit"]
        end

        test "admin can edit a post from an oauth application" do
          post = create(:post, :from_oauth_application, organization: @organization)
          sign_in @user
          get organization_post_path(@organization.slug, post.public_id)

          assert_response :ok
          assert_equal true, json_response["viewer_can_edit"]
        end

        test "member can edit a post from an oauth application" do
          other_member = create(:organization_membership, :member, organization: @organization)
          post = create(:post, :from_oauth_application, organization: @organization)
          sign_in other_member.user
          get organization_post_path(@organization.slug, post.public_id)

          assert_response :ok
          assert_equal true, json_response["viewer_can_edit"]
        end

        test "returns resource mentions" do
          same_org_post = create(:post)
          other_org_post = create(:post)

          organization = same_org_post.organization
          member = create(:organization_membership, organization: organization)

          same_org_note = create(:note, member: create(:organization_membership, organization: organization))
          open_project = create(:project, organization: organization)
          same_org_note.add_to_project!(project: open_project)

          other_org_note = create(:note)

          same_org_call = create(:call, room: create(:call_room, organization: organization))
          create(:call_peer, call: same_org_call, organization_membership: member)

          other_org_call = create(:call)

          body = <<~HTML.strip
            <resource-mention href="#{same_org_post.url}"></resource-mention>
            <resource-mention href="#{other_org_post.url}"></resource-mention>
            <resource-mention href="#{same_org_note.url}"></resource-mention>
            <resource-mention href="#{other_org_note.url}"></resource-mention>
            <resource-mention href="#{same_org_call.url}"></resource-mention>
            <resource-mention href="#{other_org_call.url}"></resource-mention>
          HTML

          post = create(:post, description_html: body, organization: organization)

          sign_in member.user
          get organization_post_path(organization.slug, post.public_id)

          assert_response :ok
          assert_equal 3, json_response["resource_mentions"].count
        end

        test "replaces resource mentions in truncated description text" do
          post = create(:post, title: "Post Title")

          organization = post.organization
          member = create(:organization_membership, organization: organization)

          note = create(:note, member: create(:organization_membership, organization: organization), title: "Note Title")
          open_project = create(:project, organization: organization)
          note.add_to_project!(project: open_project)

          call = create(:call, room: create(:call_room, organization: organization), title: "Call Title")
          create(:call_peer, call: call, organization_membership: member)

          body = <<~HTML.strip
            Foo <resource-mention href="#{post.url}"></resource-mention> bar <resource-mention href="#{note.url}"></resource-mention> baz <resource-mention href="#{call.url}"></resource-mention>
          HTML

          post = create(:post, description_html: body, organization: organization)

          sign_in member.user
          get organization_post_path(organization.slug, post.public_id)

          assert_response :ok
          assert_equal "Foo Post Title bar Note Title baz Call Title", json_response["truncated_description_text"]
        end

        test "returns 403 for a Cal.com access token" do
          @access_token = create(:access_token, :cal_dot_com, resource_owner: @author_member.user)

          get organization_post_path(@organization.slug, @post.public_id), headers: bearer_token_header(@access_token.plaintext_token)

          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_post_path(@organization.slug, @post.public_id)
          assert_response :forbidden
        end

        test "return 403 for an unauthenticated user" do
          get organization_post_path(@organization.slug, @post.public_id)
          assert_response :forbidden
        end

        test "returns 404 for a bogus org slug" do
          get organization_post_path("null", @post.public_id)
          assert_response :not_found
        end

        test "works for an unauthenticated user when post is public" do
          tag = create(:tag, organization: @organization)
          @post.update!(visibility: "public", tags: [tag])

          get organization_post_path(@organization.slug, @post.public_id)
          assert_response :ok
          assert_response_gen_schema
        end

        test "rate limits requests" do
          ip = "1.2.3.4"

          sign_in @user

          enable_rack_attack do
            simulate_rack_attack_requests(request_count: Rack::Attack::REQUESTS_BY_IP_LIMIT, ip: ip)
            headers = {
              "HTTP_FLY_CLIENT_IP" => ip,
            }
            get organization_post_path(@organization.slug, @post.public_id), headers: headers
          end

          assert_response :too_many_requests
        end

        test "does not rate limit requests with valid x-campsite-ssr-secret header" do
          ip = "1.2.3.4"

          sign_in @user

          enable_rack_attack do
            simulate_rack_attack_requests(request_count: Rack::Attack::REQUESTS_BY_IP_LIMIT, ip: ip)
            headers = {
              "HTTP_FLY_CLIENT_IP" => ip,
              "x-campsite-ssr-secret" => Rails.application.credentials.rack_attack.ssr_secret,
            }
            get organization_post_path(@organization.slug, @post.public_id), headers: headers
          end

          assert_response :ok
        end

        test "rate limits request with invalid x-campsite-ssr-secret header" do
          ip = "1.2.3.4"

          sign_in @user

          enable_rack_attack do
            simulate_rack_attack_requests(request_count: Rack::Attack::REQUESTS_BY_IP_LIMIT, ip: ip)
            headers = {
              "HTTP_FLY_CLIENT_IP" => ip,
              "x-campsite-ssr-secret" => "this-is-not-the-secret",
            }
            get organization_post_path(@organization.slug, @post.public_id), headers: headers
          end

          assert_response :too_many_requests
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

          @post.update!(description_html: html)

          sign_in @user
          get organization_post_path(@organization.slug, @post.public_id)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [mentioned_post.public_id], json_response["resource_mentions"].map { |mention| mention.dig("post", "id") }.compact
          assert_equal [mentioned_note.public_id], json_response["resource_mentions"].map { |mention| mention.dig("note", "id") }.compact
          assert_equal [mentioned_call.public_id], json_response["resource_mentions"].map { |mention| mention.dig("call", "id") }.compact
        end
      end

      context "#update" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @post = create(:post, member: @author_member, organization: @organization)
        end

        test "updates for the post creator" do
          new_title = "foo bar baz"

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id),
            params: { title: new_title },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal new_title, json_response["title"]
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @post.channel_name,
            "content-stale",
            {
              user_id: @author_member.user.public_id,
              attributes: { title: new_title },
            }.to_json,
          ])
        end

        test "does not commit post title updates with leading and trailing whitespace" do
          new_title = "  foo bar baz  "

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id),
            params: { title: new_title },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "foo bar baz", json_response["title"]
        end

        test "adds project_id for the post creator" do
          project = create(:project, organization: @organization)

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id), params: { project_id: project.public_id }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal @post.reload.project, project
        end

        test "adds existing attachments to existing post" do
          assert_equal 0, @post.attachments.count

          attachments = create_list(:attachment, 3, subject: nil)

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id), params: { attachment_ids: attachments.map(&:public_id) }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal attachments.map(&:id), @post.reload.sorted_attachments.map(&:id)
        end

        test "removes attachments from existing post" do
          @post.update!(attachments: create_list(:attachment, 3, subject: @post))
          assert_equal 3, @post.attachments.count

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id), params: { attachment_ids: [] }, as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal 0, @post.reload.attachments.count
        end

        test "updates feedback requests" do
          member1 = create(:organization_membership, :member, organization: @organization)
          member2 = create(:organization_membership, :member, organization: @organization)
          create(:post_feedback_request, post: @post, member: member1)

          sign_in @author_member.user
          put organization_post_path(@organization.slug, @post.public_id),
            params: {
              feedback_request_member_ids: [member2.public_id],
            },
            as: :json

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["feedback_requests"].count

          assert_equal 1, @post.reload.feedback_requests.kept.count
          assert_equal 1, @post.feedback_requests.discarded.count
          assert_equal member2, @post.feedback_requests.kept.first.member
          assert_equal 2, @post.subscriptions.count

          put organization_post_path(@organization.slug, @post.public_id),
            params: {
              feedback_request_member_ids: [member2.public_id, member1.public_id],
            },
            as: :json

          assert_response :ok
          assert_response_gen_schema

          assert_equal 2, json_response["feedback_requests"].count

          assert_equal 2, @post.reload.feedback_requests.kept.count
          assert_equal 0, @post.feedback_requests.discarded.count
          assert_equal 3, @post.subscriptions.count

          put organization_post_path(@organization.slug, @post.public_id),
            params: {
              feedback_request_member_ids: [],
            },
            as: :json

          assert_equal 0, json_response["feedback_requests"].count

          assert_response :ok
          assert_response_gen_schema
          assert_equal 0, @post.reload.feedback_requests.kept.count
          assert_equal 2, @post.feedback_requests.discarded.count
          assert_equal 3, @post.subscriptions.count
        end

        test "works for an org admin" do
          sign_in @user
          put organization_post_path(@organization.slug, @post.public_id),
            params: { description_html: "<p>update post description</p>" },
            as: :json

          assert_response :ok
          assert_response_gen_schema
        end

        test "does not work for other org members" do
          other_member = create(:organization_membership, :member, organization: @organization)

          sign_in other_member.user
          put organization_post_path(@organization.slug, @post.public_id),
            params: { description_html: "<p>update post description</p>" },
            as: :json

          assert_response :forbidden
        end

        test "allows members to edit integration posts" do
          member = create(:organization_membership, :member, organization: @organization)
          post = create(:post, :from_oauth_application, organization: @organization)

          sign_in member.user
          put organization_post_path(@organization.slug, post.public_id),
            params: { description_html: "<p>update post description</p>" },
            as: :json

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          put organization_post_path(@organization.slug, @post.public_id), as: :json
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_post_path(@organization.slug, @post.public_id), as: :json
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @post = create(:post, organization: @organization, member: @author_member)
        end

        test "works for an org admin" do
          sign_in @user
          delete organization_post_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_nil Post.kept.find_by(id: @post.id)
          assert_equal @member, @post.events.destroyed_action.first.actor
        end

        test "works for post creator" do
          sign_in @author_member.user
          delete organization_post_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_nil Post.kept.find_by(id: @post.id)
          assert_equal @author_member, @post.events.destroyed_action.first.actor
        end

        test "discards all comments, replies, reactions, feedback requests, and system messages" do
          comment = create(:comment, subject: @post)
          comment_on_other_post = create(:comment)
          reply = create(:comment, subject: @post, parent: comment)

          reaction = create(:reaction, subject: @post)
          reaction_on_reply = create(:reaction, subject: reply)

          feedback = create(:post_feedback_request, post: @post)

          reaction_on_other_post = create(:reaction)

          thread1 = create(:message_thread, :dm, owner: @member)
          system_message1 = thread1.send_message!(content: "system", system_shared_post: @post)

          thread2 = create(:message_thread, :dm, owner: @member)
          system_message2 = thread2.send_message!(content: "system", system_shared_post: @post)

          other_post = create(:post, organization: @organization, member: @author_member)
          other_post_thread = create(:message_thread, :dm, owner: @member)
          other_system_message = other_post_thread.send_message!(content: "system", system_shared_post: other_post)

          sign_in @user
          delete organization_post_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_predicate comment.reload, :discarded?
          assert comment.events.destroyed_action.first
          assert_predicate reply.reload, :discarded?
          assert_predicate reaction.reload, :discarded?
          assert_predicate reaction_on_reply.reload, :discarded?
          assert_not_predicate comment_on_other_post.reload, :discarded?
          assert_not_predicate reaction_on_other_post.reload, :discarded?
          assert_predicate feedback.reload, :discarded?
          assert feedback.events.destroyed_action.first
          assert_predicate system_message1.reload, :discarded?
          assert_predicate system_message2.reload, :discarded?
          assert_not_predicate other_system_message.reload, :discarded?

          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@member.id, system_message1.id, "discard-message"])
          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@member.id, system_message2.id, "discard-message"])
          refute_enqueued_sidekiq_job(InvalidateMessageJob, args: [@member.id, other_system_message.id, "discard-message"])
        end

        test "works for a member deleting a post from an oauth application" do
          member = create(:organization_membership, :member, organization: @organization)
          oauth_application = create(:oauth_application, owner: @organization)
          post = create(:post, :from_oauth_application, oauth_application: oauth_application, organization: @organization)

          sign_in member.user
          delete organization_post_path(@organization.slug, post.public_id)

          assert_response :no_content
          assert_nil Post.kept.find_by(id: post.id)
        end

        test "returns a 403 for other org members" do
          other_member = create(:organization_membership, :member, organization: @organization)

          sign_in other_member.user
          delete organization_post_path(@organization.slug, @post.public_id)

          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          delete organization_post_path(@organization.slug, @post.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_post_path(@organization.slug, @post.public_id)
          assert_response :unauthorized
        end
      end

      context "#subscribe" do
        setup do
          creator = create(:organization_membership, organization: @organization)
          @post = create(:post, organization: @organization, member: creator)
        end

        test "works for an org admin" do
          sign_in @user
          post organization_post_subscribe_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_includes @post.subscribers, @user
        end

        test "works for an org member" do
          other_member = create(:organization_membership, :member, organization: @organization).user

          sign_in other_member
          post organization_post_subscribe_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_includes @post.subscribers, other_member
        end

        test "returns a 422 if already subscribed" do
          @post.subscriptions.create(user: @user)

          sign_in @user
          post organization_post_subscribe_path(@organization.slug, @post.public_id)

          assert_response :unprocessable_entity
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          post organization_post_subscribe_path(@organization.slug, @post.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_post_subscribe_path(@organization.slug, @post.public_id)
          assert_response :unauthorized
        end
      end

      context "#unsubscribe" do
        setup do
          creator = create(:organization_membership, organization: @organization)
          @post = create(:post, organization: @organization, member: creator)
        end

        test "works for an org admin" do
          @post.subscriptions.create(user: @user)

          sign_in @user
          delete organization_post_unsubscribe_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_not_includes @post.reload.subscribers, @user
        end

        test "works for an org member" do
          other_member = create(:organization_membership, :member, organization: @organization).user
          @post.subscriptions.create(user: other_member)

          sign_in other_member
          delete organization_post_unsubscribe_path(@organization.slug, @post.public_id)

          assert_response :no_content
          assert_not_includes @post.reload.subscribers, other_member
        end

        test "returns a 404 if already unsubscribed" do
          sign_in @user
          delete organization_post_unsubscribe_path(@organization.slug, @post.public_id)

          assert_response :not_found
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          delete organization_post_unsubscribe_path(@organization.slug, @post.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_post_unsubscribe_path(@organization.slug, @post.public_id)
          assert_response :unauthorized
        end
      end

      context "#presigned_fields" do
        test "returns presigned fieldss for an admin" do
          sign_in @user
          get organization_post_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns presigned fields for a member" do
          member = create(:organization_membership, :member, organization: @organization).user
          sign_in member
          get organization_post_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_post_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_post_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }
          assert_response :unauthorized
        end
      end
    end
  end
end
