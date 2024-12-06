# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class MessageThreadMembershipUpdateCreatedEventProcessorTest < ActiveSupport::TestCase
    setup do
      @thread = create(:message_thread, :group)
      @organization = @thread.organization
      @thread_organization_membership_1 = @thread.organization_memberships.first!
      @thread_membership_1 = @thread.memberships.find_by!(organization_membership: @thread_organization_membership_1)
      @thread_organization_membership_2 = @thread.organization_memberships.second!
    end

    context "#process!" do
      test "sends a message about members being added and removed from a group chat" do
        new_member = create(:organization_membership, organization: @organization)
        @thread.update_other_organization_memberships!(
          actor: @thread_organization_membership_1,
          other_organization_memberships: @thread.organization_memberships - [@thread_organization_membership_1, @thread_organization_membership_2] + [new_member],
        )
        update = @thread.membership_updates.last!
        event = update.events.created_action.last!

        assert_difference -> { @thread.messages.count }, 2 do
          event.process!
        end

        added_message = @thread.messages.last(2).first
        removed_message = @thread.messages.last!
        assert_equal "#{@thread_organization_membership_1.display_name} added #{new_member.display_name} to this conversation.", added_message.content
        assert_equal "#{@thread_organization_membership_1.display_name} removed #{@thread_organization_membership_2.display_name} from this conversation.", removed_message.content
        assert_not_nil @thread_membership_1.reload.last_read_at
        assert_nil @thread.memberships.find_by!(organization_membership: new_member).last_read_at
      end

      test "sends a message about a member leaving a group chat" do
        @thread.leave!(@thread_organization_membership_1)
        update = @thread.membership_updates.last!
        event = update.events.created_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        message = @thread.messages.last!
        assert_equal "#{@thread_organization_membership_1.display_name} left this conversation.", message.content
      end

      test "sends a message about an oauth application being added to a chat" do
        oauth_application = create(:oauth_application, owner: @organization)
        @thread.add_oauth_application!(oauth_application: oauth_application, actor: @thread_organization_membership_1)
        update = @thread.membership_updates.last!
        event = update.events.created_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        message = @thread.messages.last!
        assert_equal "#{@thread_organization_membership_1.display_name} added the #{oauth_application.name} integration to this conversation.", message.content
      end

      test "sends a message about an oauth application being removed from a chat" do
        oauth_application = create(:oauth_application, owner: @organization)
        @thread.add_oauth_application!(oauth_application: oauth_application, actor: @thread_organization_membership_1)

        @thread.remove_oauth_application!(oauth_application: oauth_application, actor: @thread_organization_membership_1)
        update = @thread.membership_updates.last!
        event = update.events.created_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        message = @thread.messages.last!
        assert_equal "#{@thread_organization_membership_1.display_name} removed the #{oauth_application.name} integration from this conversation.", message.content
      end
    end
  end
end
