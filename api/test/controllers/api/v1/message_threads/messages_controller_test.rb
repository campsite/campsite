# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class MessagesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :dm, owner: @member)
        end

        context "#index" do
          before do
            @messages = create_list(:message, 3, message_thread: @thread)
          end

          test("it returns messages in order") do
            sign_in @member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response["data"].length
            assert_equal @messages.reverse.pluck(:public_id), json_response["data"].pluck("id")
          end

          test("it includes reactions") do
            other_members = create_list(:organization_membership, 2, organization: @organization)
            create(:reaction, subject: @messages.last, member: other_members[0], content: "👍")
            create(:reaction, subject: @messages.last, member: other_members[1], content: "👍")
            create(:reaction, subject: @messages.last, member: other_members[0], content: "❤️")

            sign_in @member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response["data"].length
            assert_equal @messages.reverse.pluck(:public_id), json_response["data"].pluck("id")

            assert_equal 2, json_response["data"].first["grouped_reactions"].length
          end

          test "returns a system message" do
            system_message = create(:message, sender: nil, message_thread: @thread)

            sign_in @member.user
            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            response_message = json_response["data"].find { |message| message["id"] == system_message.public_id }
            assert_equal true, response_message.dig("sender", "user", "system")
          end

          test "returns an integration message" do
            integration = create(:integration, owner: @organization)
            message = create(:message, integration: integration, message_thread: @thread)

            sign_in @member.user
            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            response_message = json_response["data"].find { |m| m["id"] == message.public_id }
            assert_equal integration.display_name, response_message.dig("sender", "user", "display_name")
          end

          test "returns an integration reply" do
            integration = create(:integration, owner: @organization)
            message = create(:message, sender: nil, integration: integration, message_thread: @thread)
            reply = create(:message, sender: nil, integration: integration, message_thread: @thread, reply_to: message)

            sign_in @member.user
            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            response_message = json_response["data"].find { |m| m["id"] == reply.public_id }
            assert_equal integration.display_name, response_message.dig("sender", "user", "display_name")
            assert_equal integration.display_name, response_message.dig("reply", "sender_display_name")
          end

          test("query count") do
            call = create(:call, room: create(:call_room, subject: @thread))
            create_list(:call_peer, 2, call: call)
            create(:message, message_thread: @thread, call: call)

            sign_in @member.user

            assert_query_count 15 do
              get organization_thread_messages_path(@organization.slug, @thread.public_id)
            end
          end

          test("it returns an error if the user is not a member of the thread") do
            other_member = create(:organization_membership, organization: @organization)
            sign_in other_member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "someone can see messages if the thread is part of a public project" do
            create(:project, organization: @organization, message_thread: @thread)
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user

            assert_query_count 13 do
              get organization_thread_messages_path(@organization.slug, @thread.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
          end

          test "someone can see messages if the thread is part of a private project they're a member of" do
            project = create(:project, :private, organization: @organization, message_thread: @thread)
            other_member = create(:organization_membership, organization: @organization)
            project.add_member!(other_member)

            sign_in other_member.user

            assert_query_count 10 do
              get organization_thread_messages_path(@organization.slug, @thread.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
          end

          test "someone cannot see messages if the thread is part of a private project they're not a member of" do
            create(:project, :private, organization: @organization, message_thread: @thread)
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test("admins can delete any message") do
            create(:message, sender: nil, integration: create(:integration, owner: @organization), message_thread: @thread)

            sign_in @member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_equal true, json_response["data"].all? { |message| message["viewer_can_delete"] }
          end

          test("members can only delete their own messages") do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:message_thread_membership, message_thread: @thread, organization_membership: other_member)

            # add a message from the other member and from an integration
            create(:message, sender: other_member, message_thread: @thread)
            create(:message, sender: nil, integration: create(:integration, owner: @organization), message_thread: @thread)

            sign_in other_member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            own_message = json_response["data"].find { |m| m["sender"]["id"] == other_member.public_id }
            assert_equal true, own_message["viewer_can_delete"]

            other_messages = json_response["data"].reject { |m| m["sender"]["id"] == other_member.public_id }
            assert_equal false, other_messages.any? { |m| m["viewer_can_delete"] }
          end

          test("it includes shared posts") do
            other_members = create_list(:organization_membership, 2, organization: @organization)
            create(
              :post,
              from_message: @messages.last,
              member: other_members[0],
              project: create(:project, organization: @organization),
              organization: @organization,
            )
            latest_post = create(
              :post,
              from_message: @messages.last,
              member: other_members[1],
              project: create(:project, organization: @organization),
              organization: @organization,
            )

            sign_in @member.user

            get organization_thread_messages_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal latest_post.url, json_response["data"].first["shared_post_url"]
          end
        end

        context "#create" do
          test("it creates a new message and updates the thread") do
            sign_in @member.user

            assert_difference -> { Message.count }, 1 do
              post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "<p>hello</p>" }, as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @thread.reload.messages.count
            assert_equal "<p>hello</p>", @thread.latest_message.content

            message = @thread.messages.last
            assert_equal @member, message.sender

            assert_equal message.public_id, json_response["message"]["id"]
            assert_equal "hello", json_response["message_thread"]["latest_message_truncated"]
            assert json_response["message"]["viewer_is_sender"]
          end

          test("it creates a new message and updates the thread with a reply") do
            sign_in @member.user
            post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "hello" }, as: :json
            @reply_to = @thread.reload.latest_message

            assert_difference -> { Message.count }, 1 do
              post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "how are you?", reply_to: @reply_to.public_id }, as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal 2, @thread.reload.messages.count
            assert_equal "how are you?", @thread.latest_message.content
            assert_equal @reply_to, @thread.latest_message.reply_to
          end

          test "it creates a new message with attachments" do
            attachment_name = "my-image.png"
            attachment_size = 1.megabyte

            sign_in @member.user
            post organization_thread_messages_path(@organization.slug, @thread.public_id),
              params: {
                content: " ",
                attachments: [
                  { file_type: "image/png", file_path: "/path/to/image.png", name: attachment_name, size: attachment_size },
                  { file_type: "link", file_path: "https://campsite.design" },
                ],
              },
              as: :json

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @thread.reload.messages.count
            assert_equal 2, @thread.latest_message.attachments.count
          end

          test "rejects empty messages" do
            sign_in @member.user

            assert_no_difference -> { Message.count } do
              post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: " " }, as: :json
            end

            assert_response :unprocessable_entity
          end

          test("query count") do
            sign_in @member.user

            assert_query_count 17 do
              post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "hello" }, as: :json
            end
          end

          test("it returns an error if the user is not a member of the thread") do
            other_member = create(:organization_membership, organization: @organization)
            sign_in other_member.user

            post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "hello" }, as: :json

            assert_response :forbidden
          end

          test "someone can create a message if the thread is part of a public project" do
            create(:project, organization: @organization, message_thread: @thread)
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "hello" }, as: :json

            assert_response :created
            assert_response_gen_schema
          end

          test("it queues a pusher event") do
            sign_in @member.user

            post organization_thread_messages_path(@organization.slug, @thread.public_id), params: { content: "hello" }, as: :json

            assert_response :created
            assert_response_gen_schema

            assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [
              @member.id,
              @thread.reload.messages.last.id,
              "new-message",
            ])
          end
        end

        context "#update" do
          test "it returns an error if the user is not sender" do
            message = create(:message, message_thread: @thread, sender: @thread.owner)

            other_member = create(:organization_membership, :member, organization: @organization)
            create(:message_thread_membership, message_thread: @thread, organization_membership: other_member)
            sign_in other_member.user

            put organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id), params: { content: "hello" }, as: :json

            assert_response :forbidden
          end

          test "it updates a message" do
            message = create(:message, message_thread: @thread, sender: @member)

            sign_in @member.user

            put organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id), params: { content: "hello" }, as: :json

            assert_response :no_content
            assert_equal "hello", message.reload.content
          end

          test("it queues a pusher event") do
            message = create(:message, message_thread: @thread, sender: @thread.owner)

            sign_in @member.user

            put organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id), params: { content: "hello" }, as: :json

            assert_response :no_content

            assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [
              @member.id,
              message.id,
              "update-message",
            ])
          end

          test("query count") do
            message = create(:message, message_thread: @thread, sender: @thread.owner)
            sign_in @member.user

            assert_query_count 9 do
              put organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id), params: { content: "hello" }, as: :json
            end
          end
        end

        context "#destroy" do
          test "it returns an error if the user is not sender" do
            message = create(:message, message_thread: @thread, sender: @thread.owner)

            other_member = create(:organization_membership, :member, organization: @organization)
            create(:message_thread_membership, message_thread: @thread, organization_membership: other_member)
            sign_in other_member.user

            delete organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id)

            assert_response :forbidden
          end

          test "it deletes a message" do
            message = create(:message, message_thread: @thread, sender: @member)

            sign_in @member.user

            assert_difference -> { Message.kept.count }, -1 do
              delete organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id)
            end

            assert_response :no_content
            assert_equal 0, @thread.reload.messages.kept.count
          end

          test "allows admins to delete any message" do
            message = create(:message, message_thread: @thread, sender: @thread.owner)

            admin = create(:organization_membership, organization: @organization)
            create(:message_thread_membership, message_thread: @thread, organization_membership: admin)
            sign_in admin.user

            assert_difference -> { Message.kept.count }, -1 do
              delete organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id)
            end

            assert_response :no_content
            assert_equal 0, @thread.reload.messages.kept.count
          end

          test("it queues a pusher event") do
            message = create(:message, message_thread: @thread, sender: @thread.owner)

            sign_in @member.user

            delete organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id)

            assert_response :no_content

            assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [
              @member.id,
              message.id,
              "discard-message",
            ])
          end

          test("query count") do
            message = create(:message, message_thread: @thread, sender: @thread.owner)
            sign_in @member.user

            assert_query_count 12 do
              delete organization_thread_message_path(@organization.slug, @thread.public_id, message.public_id)
            end
          end
        end
      end
    end
  end
end
