# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class MessageThreadsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @organization = @member.organization
      end

      context "#index" do
        test("it returns threads in recent order") do
          threads = [
            create(:message_thread, :group, owner: @member, last_message_at: 1.day.ago),
            create(:message_thread, :group, owner: @member),
            create(:message_thread, :dm, owner: @member, last_message_at: 6.days.ago),
            create(:message_thread, :group, owner: @member, last_message_at: 3.days.ago),
            create(:message_thread, :group, owner: @member),
          ]

          sign_in @member.user
          get organization_threads_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [threads[0], threads[3], threads[2], threads[4], threads[1]].pluck(:public_id), json_response["threads"].pluck("id")
        end

        test("it includes unseen counts") do
          threads = create_list(:message_thread, 3, :dm, owner: @member)

          other_member = create(:organization_membership, organization: @organization)
          threads[0].send_message!(sender: @member, content: "hello")
          threads[1].send_message!(sender: @member, content: "hello")
          threads[2].send_message!(sender: @member, content: "hello")
          threads[1].send_message!(sender: other_member, content: "hi")

          sign_in @member.user
          get organization_threads_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [threads[1], threads[2], threads[0]].pluck(:public_id), json_response["threads"].pluck("id")
          assert_equal [1, 0, 0], json_response["threads"].pluck("unread_count")
        end

        test "it excludes chat channel message threads" do
          thread = create(:message_thread, :group, owner: @member)
          create(:project, message_thread: thread, organization: @organization)

          sign_in @member.user
          get organization_threads_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal [], json_response["threads"]
        end

        test("query count") do
          oauth_application = create(:oauth_application, owner: @organization)
          create(:message_thread, :group, owner: @member)
          create(:message_thread, :dm, owner: @member)
          create(:message_thread, :group, owner: @member)
          create(:message_thread, :dm, owner: oauth_application, organization_memberships: [@member], oauth_applications: [oauth_application])

          sign_in @member.user

          assert_query_count 10 do
            get organization_threads_path(@organization.slug)
          end
        end

        test("it returns an error if the user is not an org member") do
          other_member = create(:organization_membership)
          sign_in other_member.user

          get organization_threads_path(@organization.slug)

          assert_response :forbidden
        end
      end

      context "#show" do
        test("it returns a thread") do
          thread = create(:message_thread, :dm, owner: @member)

          sign_in @member.user
          get organization_thread_path(@organization.slug, thread.public_id)

          assert_response :ok
          assert_response_gen_schema

          assert_equal thread.public_id, json_response["id"]
          assert_equal false, json_response["manually_marked_unread"]
        end

        test "it returns a manually marked unread thread" do
          thread = create(:message_thread, :dm, owner: @member)
          thread.mark_unread(@member)

          sign_in @member.user
          get organization_thread_path(@organization.slug, thread.public_id)

          assert_response :ok
          assert_response_gen_schema

          assert_equal thread.public_id, json_response["id"]
          assert_equal true, json_response["manually_marked_unread"]
        end

        test("query count") do
          thread = create(:message_thread, :dm, owner: @member)

          sign_in @member.user

          assert_query_count 9 do
            get organization_thread_path(@organization.slug, thread.public_id)
          end
        end

        test("it returns an error if the user not a thread member") do
          thread = create(:message_thread, :dm, owner: @member)
          other_member = create(:organization_membership, organization: @organization)

          sign_in other_member.user
          get organization_thread_path(@organization.slug, thread.public_id)

          assert_response :forbidden
        end

        test "a non-member can view a project chat" do
          thread = create(:message_thread, :group, owner: create(:organization_membership, organization: @organization))
          create(:project, message_thread: thread, organization: @organization)

          sign_in @member.user
          get organization_thread_path(@organization.slug, thread.public_id)

          assert_response :ok
          assert_response_gen_schema
        end

        test "a non-member cannot view a private project chat they aren't a member of" do
          thread = create(:message_thread, :group, owner: create(:organization_membership, organization: @organization))
          create(:project, :private, message_thread: thread, organization: @organization)

          sign_in @member.user
          get organization_thread_path(@organization.slug, thread.public_id)

          assert_response :forbidden
        end
      end

      context "#create" do
        test("it creates a dm thread") do
          other_member = create(:organization_membership, organization: @organization)

          sign_in @member.user

          assert_difference -> { MessageThread.count }, 1 do
            post organization_threads_path(@organization.slug),
              params: {
                member_ids: [other_member.public_id],
                content: "hello",
                attachments: [{ file_type: "image/png", file_path: "/path/to/image.png" }],
              },
              as: :json
          end

          assert_response :created
          assert_response_gen_schema

          thread = MessageThread.last
          assert_equal @member, thread.owner
          assert_equal 2, thread.organization_memberships.count
          assert_includes thread.organization_memberships, @member
          assert_includes thread.organization_memberships, other_member
          assert_equal 1, thread.messages.count
          assert_equal "hello", thread.latest_message.content
          assert_equal 1, thread.latest_message.attachments.count
          assert_not_predicate thread, :group?
          assert_enqueued_sidekiq_job(CreateMessageThreadCallRoomJob, args: [thread.id])
        end

        test("it creates a group thread") do
          other_members = create_list(:organization_membership, 3, organization: @organization)

          sign_in @member.user

          assert_difference -> { MessageThread.count }, 1 do
            post organization_threads_path(@organization.slug), params: { member_ids: other_members.pluck(:public_id), content: "hello" }, as: :json
          end

          assert_response :created
          assert_response_gen_schema

          thread = MessageThread.last
          assert_equal @member, thread.owner
          assert_equal 4, thread.organization_memberships.count
          assert_includes thread.organization_memberships, @member
          assert_includes thread.organization_memberships, other_members[0]
          assert_includes thread.organization_memberships, other_members[1]
          assert_includes thread.organization_memberships, other_members[2]
          assert_equal 1, thread.messages.count
          assert_equal "hello", thread.latest_message.content
          assert_equal "#{@member.display_name}: hello", thread.latest_message_truncated
          assert_equal "You: hello", thread.latest_message_truncated(viewer: @member)
          assert_predicate thread, :group?
        end

        test("it creates a thread without requiring a message") do
          other_members = create_list(:organization_membership, 4, organization: @organization)

          sign_in @member.user
          post organization_threads_path(@organization.slug),
            params: { title: "My cool thread", member_ids: other_members.pluck(:public_id) },
            as: :json

          assert_response :created
          assert_response_gen_schema

          thread = MessageThread.last
          assert_equal 0, thread.messages.count
          assert_equal "My cool thread", thread.title
        end

        test("it creates a dm thread with oauth applications") do
          oauth_application = create(:oauth_application, owner: @organization)

          sign_in @member.user
          post organization_threads_path(@organization.slug),
            params: {
              oauth_application_ids: [oauth_application.public_id],
            },
            as: :json

          assert_response :created
          assert_response_gen_schema

          thread = MessageThread.last
          assert_equal oauth_application.name, thread.formatted_title
          assert_equal [oauth_application], thread.oauth_applications
        end

        test("it returns an error if the user already has a dm with the oauth application") do
          thread = create(:message_thread, :app_dm)

          sign_in thread.organization_memberships.first.user

          post organization_threads_path(thread.organization.slug),
            params: {
              oauth_application_ids: [thread.oauth_applications.first.public_id],
            },
            as: :json

          assert_response :unprocessable_entity
        end

        test("query count") do
          other_members = create_list(:organization_membership, 4, organization: @organization)
          sign_in @member.user

          assert_query_count 32 do
            post organization_threads_path(@organization.slug), params: { member_ids: other_members.pluck(:public_id), content: "hello" }, as: :json
          end
        end

        test("it returns an error if the user is not an org member") do
          other_member = create(:organization_membership)
          sign_in other_member.user

          get organization_threads_path(@organization.slug)

          assert_response :forbidden
        end

        test "it returns an error if the client tries to create a duplicate DM" do
          dm = create(:message_thread, :dm, owner: @member)
          other_member = dm.other_members(@member).first

          sign_in @member.user

          post organization_threads_path(@organization.slug), params: { member_ids: [other_member.public_id], content: "hello" }, as: :json

          assert_response :unprocessable_entity
        end

        test "it lets user create new group chat with member with whom they already have a DM" do
          dm = create(:message_thread, :dm, owner: @member)
          other_member = dm.other_members(@member).first

          sign_in @member.user

          assert_difference -> { MessageThread.count }, 1 do
            post organization_threads_path(@organization.slug), params: { group: true, member_ids: [other_member.public_id], content: "hello" }, as: :json
          end

          assert_response :created
        end

        test "it lets user create new DM if they have a DM with another user" do
          create(:message_thread, :dm, owner: @member)
          other_member = create(:organization_membership, organization: @organization)

          sign_in @member.user

          assert_difference -> { MessageThread.count }, 1 do
            post organization_threads_path(@organization.slug), params: { member_ids: [other_member.public_id], content: "hello" }, as: :json
          end

          assert_response :created
        end
      end

      context "#update" do
        before do
          @thread = create(:message_thread, :group, owner: @member)
          @new_title = "My v cool thread"
          @new_image_path = "o/foobar/p/image.png"
        end

        test "it updates a thread" do
          sign_in @member.user
          assert_query_count 15 do
            put organization_thread_path(@organization.slug, @thread.public_id), params: { title: @new_title, image_path: @new_image_path }, as: :json
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @new_title, json_response["title"]
          assert_includes json_response["image_url"], @new_image_path
          event = @thread.events.updated_action.last!
          assert_equal @member, event.actor
        end

        test "it doesn't change a field if key is missing" do
          @thread.update!(title: @new_title, image_path: @new_image_path)

          sign_in @member.user
          put organization_thread_path(@organization.slug, @thread.public_id), as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal @new_title, json_response["title"]
          assert_includes json_response["image_url"], @new_image_path
        end

        test "it nils a field if key is present but blank" do
          @thread.update!(title: @new_title, image_path: @new_image_path)

          sign_in @member.user
          put organization_thread_path(@organization.slug, @thread.public_id, params: { title: "", image_path: "" }), as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "Harry Potter and 2 others", json_response["title"]
          assert_nil json_response["image_url"]
        end

        test "it doesn't allow changes to a DM" do
          thread = create(:message_thread, :dm, owner: @member)

          sign_in @member.user
          put organization_thread_path(@organization.slug, thread.public_id)

          assert_response :forbidden
        end

        test "it doesn't let a non-thread member update a thread" do
          sign_in create(:organization_membership, organization: @organization).user
          put organization_thread_path(@organization.slug, @thread.public_id), params: { title: @new_title, image_path: @new_image_path }, as: :json

          assert_response :forbidden
        end

        test "it doesn't let a logged out user update a thread" do
          put organization_thread_path(@organization.slug, @thread.public_id), params: { title: @new_title, image_path: @new_image_path }, as: :json

          assert_response :unauthorized
        end
      end

      context "#destroy" do
        before do
          @thread = create(:message_thread, :group, owner: @member)
        end

        test "destroys message thread for org admin" do
          sign_in @member.user
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :no_content
          assert_nil MessageThread.find_by(id: @thread.id)
        end

        test "destroys message thread for org member" do
          org_member = create(:organization_membership, :member, organization: @organization)
          create(:message_thread_membership, message_thread: @thread, organization_membership: org_member)

          sign_in org_member.user
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :no_content
          assert_nil MessageThread.find_by(id: @thread.id)
        end

        test "enqueues job to send Pusher event to message thread members when thread is destroyed" do
          org_member = create(:organization_membership, :member, organization: @organization)
          create(:message_thread_membership, message_thread: @thread, organization_membership: org_member)

          sign_in org_member.user
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :no_content
          assert_nil MessageThread.find_by(id: @thread.id)

          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [org_member.user.channel_name, "thread-destroyed", { message_thread_id: @thread.public_id, organization_slug: @organization.slug }.to_json])
        end

        test "viewer cannot destroy a thread" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)
          create(:message_thread_membership, message_thread: @thread, organization_membership: viewer_member)

          sign_in viewer_member.user
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :forbidden
          assert MessageThread.find_by(id: @thread.id)
        end

        test "returns 403 for user that is not a member of the thread" do
          org_member = create(:organization_membership, :member, organization: @organization)

          sign_in org_member.user
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :forbidden
        end

        test "returns 401 for an unauthenticated user" do
          delete organization_thread_path(@organization.slug, @thread.public_id)

          assert_response :unauthorized
        end
      end
    end
  end
end
