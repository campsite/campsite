# frozen_string_literal: true

require "test_helper"

module Backfills
  class ChatChannelBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @org_a_member = create(:organization_membership)
        @org_b_member = create(:organization_membership)
        @org_a = @org_a_member.organization
        @org_b = @org_b_member.organization
        @org_a_group_thread = create(:message_thread, :group, title: "Engineering", owner: @org_a_member, organization_memberships: [@org_a_member])
        create(:message_thread, :group, title: "", owner: @org_a_member, organization_memberships: [@org_a_member])
        create(:message_thread, :dm, owner: @org_a_member)
        org_a_chat_channel_thread = create(:message_thread, :group, title: "Engineering", owner: @org_a_member, organization_memberships: [@org_a_member])
        create(:project, message_thread: org_a_chat_channel_thread)
        create(:message_thread, :group, title: nil, owner: @org_a_member, organization_memberships: [@org_a_member])
        @org_b_group_thread = create(:message_thread, :group, title: "Engineering", owner: @org_b_member, organization_memberships: [@org_b_member])
        create(:message_thread, :dm, owner: @org_b_member)
      end

      test "moves titled group chats to private chat channels for specified organization" do
        ChatChannelBackfill.run(dry_run: false, organization_slug: @org_a.slug)

        assert_enqueued_sidekiq_jobs(1, only: CreateProjectFromMessageThreadJob)
        assert_enqueued_sidekiq_job(CreateProjectFromMessageThreadJob, args: [@org_a_group_thread.id])
      end

      test "moves all group chats to private chat channels when no organization specified" do
        ChatChannelBackfill.run(dry_run: false)

        assert_enqueued_sidekiq_jobs(2, only: CreateProjectFromMessageThreadJob)
        assert_enqueued_sidekiq_job(CreateProjectFromMessageThreadJob, args: [@org_a_group_thread.id])
        assert_enqueued_sidekiq_job(CreateProjectFromMessageThreadJob, args: [@org_b_group_thread.id])
      end

      test "dry run is a no-op" do
        ChatChannelBackfill.run

        refute_enqueued_sidekiq_job(CreateProjectFromMessageThreadJob)
      end
    end
  end
end
