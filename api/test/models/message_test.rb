# frozen_string_literal: true

require "test_helper"

class MessageTest < ActiveSupport::TestCase
  context "#preview_truncated" do
    test "unescapes" do
      message = create(:message, content: "<p>foo &lt;&gt; bar</p>")
      assert_equal "foo <> bar", message.preview_truncated
    end

    test "works with calls" do
      message = create(:message, content: "", call: create(:call))
      assert_equal "#{message.sender.display_name} started a call", message.preview_truncated
    end
  end

  context "#discard" do
    test "updates latest_message" do
      thread = create(:message_thread, :group)
      create(:message, message_thread: thread, created_at: 10.minutes.ago)
      old_message = create(:message, message_thread: thread, created_at: 5.minutes.ago)
      new_message = create(:message, message_thread: thread, created_at: 1.minute.ago)
      thread.update_columns(latest_message_id: new_message.id)

      assert_equal new_message, thread.latest_message

      new_message.discard

      assert_equal old_message, thread.reload.latest_message
    end
  end

  context "#prerenders" do
    test "returns latest shared post url for each message" do
      viewer = create(:organization_membership)

      thread1 = create(:message_thread, :group, owner: viewer)
      thread2 = create(:message_thread, :dm, owner: viewer)
      thread3 = create(:message_thread, :group, owner: viewer)

      message1 = create(:message, message_thread: thread1)
      message2 = create(:message, message_thread: thread2)
      message3 = create(:message, message_thread: thread3)
      message4 = create(:message, message_thread: thread1)

      create(:post, from_message: message1, member: viewer, organization: viewer.organization)
      post2 = create(:post, from_message: message2, member: viewer, organization: viewer.organization)
      post3 = create(:post, from_message: message3, member: viewer, organization: viewer.organization)
      newer_post1 = create(:post, from_message: message1, member: viewer, organization: viewer.organization)

      messages = [message1, message2, message3, message4]
      result = Message.latest_shared_post_async(ids: messages.pluck(:id), user: viewer.user).value

      assert_equal newer_post1, result[message1.id]
      assert_equal post2, result[message2.id]
      assert_equal post3, result[message3.id]
      assert_nil result[message4.id]
    end

    test "returns posts in projects the viewer can access" do
      viewer = create(:organization_membership)

      thread1 = create(:message_thread, :group, owner: viewer)
      thread2 = create(:message_thread, :dm, owner: viewer)

      message1 = create(:message, message_thread: thread1)
      message2 = create(:message, message_thread: thread2)
      message3 = create(:message, message_thread: thread1)

      non_member_private_project = create(:project, :private, organization: viewer.organization)
      member_private_project = create(:project, :private, organization: viewer.organization)
      create(:project_membership, organization_membership: viewer, project: member_private_project)
      non_member_open_project = create(:project, organization: viewer.organization)
      member_open_project = create(:project, organization: viewer.organization)
      create(:project_membership, organization_membership: viewer, project: member_open_project)

      post1 = create(:post, from_message: message1, member: viewer, project: member_private_project, organization: viewer.organization)
      create(:post, from_message: message1, member: viewer, project: non_member_private_project, organization: viewer.organization)
      create(:post, from_message: message2, member: viewer, project: member_open_project, organization: viewer.organization)
      post4 = create(:post, from_message: message2, member: viewer, project: non_member_open_project, organization: viewer.organization)
      create(:post, from_message: message3, member: viewer, project: non_member_private_project, organization: viewer.organization)

      messages = [message1, message2, message3]
      result = Message.latest_shared_post_async(ids: messages.pluck(:id), user: viewer.user).value

      assert_equal post1, result[message1.id]
      assert_equal post4, result[message2.id]
      assert_nil result[message3.id]
    end

    test "ignores discarded posts" do
      viewer = create(:organization_membership)

      thread1 = create(:message_thread, :group, owner: viewer)

      message1 = create(:message, message_thread: thread1)

      post1 = create(:post, from_message: message1, member: viewer, organization: viewer.organization)
      post2 = create(:post, from_message: message1, member: viewer, organization: viewer.organization)
      post2.discard

      result = Message.latest_shared_post_async(ids: [message1.id], user: viewer.user).value

      assert_equal post1, result[message1.id]
    end
  end

  context "#links_in_content" do
    test "returns links in content" do
      message = create(:message, content: "foo <a href='https://example.com'>bar</a> baz <a href='https://google.com'>bar</a>")
      assert_equal ["https://example.com", "https://google.com"], message.links_in_content
    end

    test "skips http" do
      message = create(:message, content: "foo <a href='http://example.com'>bar</a> baz <a href='https://google.com'>bar</a>")
      assert_equal ["https://google.com"], message.links_in_content
    end

    test "skips relative" do
      message = create(:message, content: "foo <a href='/foo/bar.png'>bar</a> baz <a href='https://google.com'>bar</a>")
      assert_equal ["https://google.com"], message.links_in_content
    end

    test "gracefully fails on invalid urls" do
      message = create(:message, content: "foo <a href='http://localhost:9000/acme/invoices/new/files/:fileId`'>bar</a> baz <a href='https://google.com'>bar</a>")
      assert_equal ["https://google.com"], message.links_in_content

      message = create(:message, content: "foo <a href='mailto:addressbook#contacts@group.v.calendar.google.com'>mailto:addressbook#contacts@group.v.calendar.google.com</a> baz <a href='https://google.com'>bar</a>")
      assert_equal ["https://google.com"], message.links_in_content
    end
  end
end
