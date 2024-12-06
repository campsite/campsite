# frozen_string_literal: true

require "test_helper"

class MessageThreadTest < ActiveSupport::TestCase
  context "#other_members" do
    test "it returns the other members" do
      thread = create(:message_thread, :group, title: "hello")
      assert_not_includes thread.other_members(thread.owner), thread.owner
    end

    test "it does not return discarded members" do
      thread = create(:message_thread, :group, title: "hello")
      member = thread.organization_memberships.first
      member.discard
      assert_not_includes thread.other_members(thread.owner), member
    end
  end

  context "#formatted_title" do
    test "it returns the title if present" do
      thread = create(:message_thread, title: "hello")
      assert_equal "hello", thread.formatted_title(thread.owner)
    end

    test "it returns the other member's name if there is only one other member" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: nil), organization: member1.organization)
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2])
      assert_equal "member2", thread.formatted_title(member1)
    end

    test "it returns the other member's name if the one other member has been deactivated" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: nil), organization: member1.organization)
      member2.discard
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2])
      assert_equal "member2", thread.formatted_title(member1)
    end

    test "it returns both other member names if 3" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: "Member 2"), organization: member1.organization)
      member3 = create(:organization_membership, user: create(:user, username: "member3", name: nil), organization: member1.organization)
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2, member3])
      assert_equal "Member 2 and member3", thread.formatted_title(member1)
    end

    test "it returns a count of other members if over 3" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: "Member 2"), organization: member1.organization)
      others = create_list(:organization_membership, 4, organization: member1.organization)
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2] + others)
      assert_equal "Member 2 and 4 others", thread.formatted_title(member1)
    end
  end

  context "#default_call_title" do
    test "it returns the title if present" do
      thread = create(:message_thread, title: "hello")
      assert_equal "hello", thread.default_call_title(thread.owner)
    end

    test "it returns 'Just you' if they are the only member" do
      member = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      thread = create(:message_thread, organization_memberships: [member])
      assert_equal "Just you", thread.default_call_title(member)
    end

    test "it returns the other member's and this member's name if there is only one other member" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: nil), organization: member1.organization)
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2])
      assert_equal "member2 and member1", thread.default_call_title(member1)
    end

    test "it returns a count of all members if over 2" do
      member1 = create(:organization_membership, user: create(:user, username: "member1", name: nil))
      member2 = create(:organization_membership, user: create(:user, username: "member2", name: "Member 2"), organization: member1.organization)
      member3 = create(:organization_membership, user: create(:user, username: "member3", name: nil), organization: member1.organization)
      thread = create(:message_thread, owner: member1, organization_memberships: [member1, member2, member3])
      assert_equal "Member 2 and 2 others", thread.default_call_title(member1)
    end
  end

  context "#preloads" do
    test "it returns counts for each thread" do
      member = create(:organization_membership)
      other_member = create(:organization_membership, organization: member.organization)
      threads = create_list(:message_thread, 3, :group, owner: member, organization_memberships: [member, other_member])
      threads[0].send_message!(sender: member, content: "hello")
      threads[1].send_message!(sender: other_member, content: "hello")
      threads[2].send_message!(sender: other_member, content: "hello")
      threads[2].send_message!(sender: member, content: "hi")
      threads[2].send_message!(sender: other_member, content: "yo")

      unread_counts = MessageThread.unread_counts_async(threads.map(&:id), member).value

      assert_equal 3, unread_counts.length
      assert_equal 0, unread_counts[threads[0].id]
      assert_equal 1, unread_counts[threads[1].id]
      assert_equal 1, unread_counts[threads[2].id]
    end

    test "manually marked read" do
      member = create(:organization_membership)
      other_member = create(:organization_membership, organization: member.organization)
      threads = create_list(:message_thread, 3, :group, owner: member, organization_memberships: [member, other_member])
      threads[0].send_message!(sender: member, content: "hello")
      threads[1].send_message!(sender: other_member, content: "hello")
      threads[2].send_message!(sender: other_member, content: "hello")
      threads[2].send_message!(sender: member, content: "hi")
      threads[2].send_message!(sender: other_member, content: "yo")

      threads.each { |t| t.mark_read(member) }
      threads[1].mark_unread(member)

      result = MessageThread.manually_marked_unread_async(threads.map(&:id), member).value

      assert_not result[threads[0].id]
      assert result[threads[1].id]
      assert_not result[threads[2].id]
    end

    test "favorites" do
      member = create(:organization_membership)
      threads = create_list(:message_thread, 2, :group, owner: member)
      create(:favorite, favoritable: threads[0], organization_membership: member)

      result = MessageThread.viewer_has_favorited_async(threads.map(&:id), member).value

      assert result[threads[0].id]
      assert_not result[threads[1].id]
    end

    test "viewer_is_thread_member" do
      member = create(:organization_membership)
      thread1 = create(:message_thread, :group, owner: member)
      thread2 = create(:message_thread, :group)

      assert thread1.viewer_is_thread_member?(member)
      assert_not thread2.viewer_is_thread_member?(member)
    end
  end

  context "#create_hms_call_room!" do
    test "it creates a call room and sets the remote_call_room_id" do
      room_id = "abc123"
      HmsClient.any_instance.expects(:create_room).returns(Hms::Room.new({ "id" => room_id }))
      thread = create(:message_thread)
      thread.create_hms_call_room!

      assert_equal room_id, thread.remote_call_room_id
    end
  end

  context "#oauth_applications" do
    setup do
      @thread = create(:message_thread)
      @member = @thread.owner
      @organization = @member.organization
      @oauth_application = create(:oauth_application, owner: @organization)
    end

    test "it adds an oauth application" do
      @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)
      assert_includes @thread.oauth_applications, @oauth_application
    end

    test "it does not add a duplicate oauth application" do
      @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)
      @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)
      assert_includes @thread.oauth_applications, @oauth_application
      assert_equal 1, @thread.oauth_applications.count
    end

    test "it removes an oauth application" do
      @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)
      @thread.remove_oauth_application!(oauth_application: @oauth_application, actor: @member)
      assert_not_includes @thread.oauth_applications, @oauth_application
    end
  end

  context "#send_message!" do
    setup do
      @thread = create(:message_thread)
      @member = @thread.owner
      @organization = @member.organization
      @oauth_application = create(:oauth_application, owner: @organization)
      @webhook = create(:webhook, owner: @oauth_application, event_types: ["app.mentioned"])
      @thread.add_oauth_application!(oauth_application: @oauth_application, actor: @member)
      @mention = MentionsFormatter.format_mention(@webhook.owner)
    end

    test "it notifies apps mentioned in the message" do
      message = @thread.send_message!(sender: @member, content: "Hi #{@mention}")

      assert_enqueued_sidekiq_job DeliverWebhookJob

      assert_equal message.id, WebhookEvent.where(event_type: "app.mentioned").first!.subject_id
    end

    test "it does not notify mentioned apps that are not in the thread" do
      @thread.remove_oauth_application!(oauth_application: @oauth_application, actor: @member)
      @thread.send_message!(sender: @member, content: "Hi #{@mention}")

      refute_enqueued_sidekiq_job DeliverWebhookJob
    end

    test "it sends a system message if an app is mentioned but the app is not in the thread" do
      @thread.remove_oauth_application!(oauth_application: @oauth_application, actor: @member)
      @thread.send_message!(sender: @member, content: "Hi #{@mention}")

      refute_enqueued_sidekiq_job DeliverWebhookJob

      assert @thread.messages.last.system?
      assert_includes @thread.messages.last.content, "#{@oauth_application.name} could not see this message because it is not a member of this thread."
    end

    test "it sends a message.dm event for messages in a dm thread" do
      thread = create(:message_thread, :app_dm)
      create(:webhook, owner: thread.owner, event_types: ["message.dm", "message.created"])
      member = thread.organization_memberships.first
      message = thread.send_message!(sender: member, content: "hello")

      assert_enqueued_sidekiq_job DeliverWebhookJob

      assert_equal 1, WebhookEvent.where(event_type: "message.dm").count
      assert_equal 0, WebhookEvent.where(event_type: "message.created").count

      assert_equal message.id, WebhookEvent.where(event_type: "message.dm").first!.subject_id
    end

    test "it sends a message.created event for messages in a non-dm thread" do
      @webhook.update!(event_types: ["message.created", "message.dm"])
      message = @thread.send_message!(sender: @member, content: "hello")

      assert_enqueued_sidekiq_job DeliverWebhookJob

      assert_equal 0, WebhookEvent.where(event_type: "message.dm").count
      assert_equal 1, WebhookEvent.where(event_type: "message.created").count

      assert_equal message.id, WebhookEvent.where(event_type: "message.created").first!.subject_id
    end

    test "it does not send a message.created event to an integration for a message sent by that integration" do
      @webhook.update!(event_types: ["message.created"])
      @thread.send_message!(oauth_application: @oauth_application, content: "hello")

      refute_enqueued_sidekiq_job DeliverWebhookJob
    end

    test "it does not send a message.dm event to an integration for a message sent by that integration" do
      thread = create(:message_thread, :app_dm)
      app = thread.oauth_applications.first
      create(:webhook, owner: app, event_types: ["message.dm"])

      thread.send_message!(oauth_application: app, content: "hello")

      refute_enqueued_sidekiq_job DeliverWebhookJob
    end

    test "it sends a message.created event to an integration for a public chat project" do
      @webhook.update!(event_types: ["message.created"])
      project = create(:project, :chat_project, organization: @organization, creator: @member)
      message = project.message_thread.send_message!(sender: @member, content: "hello")

      assert_enqueued_sidekiq_job DeliverWebhookJob

      assert_equal message.id, WebhookEvent.where(event_type: "message.created").first!.subject_id
    end
  end

  context "#url" do
    test "returns thread URL" do
      thread = create(:message_thread)

      assert_equal "http://app.campsite.test:3000/#{thread.organization.slug}/chat/#{thread.public_id}", thread.url
    end

    test "returns project URL when project present" do
      thread = create(:message_thread)
      project = create(:project, organization: thread.organization, message_thread: thread)

      assert_equal project.url, thread.url
    end
  end
end
