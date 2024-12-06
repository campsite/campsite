# frozen_string_literal: true

require "test_helper"

class InvalidateMessageJobTest < ActiveJob::TestCase
  context "perform" do
    test "it queues message jobs for the other members" do
      member = create(:organization_membership)
      other_members = create_list(:organization_membership, 3, organization: member.organization)
      discarded_member = create(:organization_membership, :discarded, organization: member.organization)
      message_thread = create(:message_thread, owner: member, organization_memberships: [member, discarded_member] + other_members)
      message = create(:message, message_thread: message_thread, sender: member)

      InvalidateMessageJob.new.perform(member.id, message.id, "new-message")

      assert_enqueued_sidekiq_job(MessageJob, args: [
        other_members[0].id,
        message.id,
        "new-message",
      ])
      refute_enqueued_sidekiq_job(MessageJob, args: [
        discarded_member.id,
        message.id,
        "new-message",
      ])
      assert_enqueued_sidekiq_job(MessageJob, args: [
        other_members[1].id,
        message.id,
        "new-message",
      ])
      assert_enqueued_sidekiq_job(MessageJob, args: [
        other_members[2].id,
        message.id,
        "new-message",
      ])
    end
  end
end
