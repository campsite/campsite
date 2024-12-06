# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class MessageThreadUpdatedEventProcessorTest < ActiveSupport::TestCase
    setup do
      @thread = create(:message_thread, :group)
      @organization = @thread.organization
      @thread_organization_membership_1 = @thread.organization_memberships.first!
      @thread_membership_1 = @thread.memberships.find_by!(organization_membership: @thread_organization_membership_1)
      @thread_organization_membership_2 = @thread.organization_memberships.second!
      @thread_membership_2 = @thread.memberships.find_by!(organization_membership: @thread_organization_membership_2)
    end

    context "#process!" do
      test "sends a message about a title change" do
        new_title = "New title"
        @thread.update!(title: new_title, event_actor: @thread_organization_membership_1)
        event = @thread.events.updated_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        assert_equal "#{@thread_organization_membership_1.display_name} changed the title to “#{new_title}.”", @thread.messages.last!.content
        assert_not_nil @thread_membership_1.reload.last_read_at
        assert_nil @thread_membership_2.reload.last_read_at
      end

      test "removing thread title converts to default title" do
        @thread.update!(title: "has a title", event_actor: @thread_organization_membership_1)
        event = @thread.events.updated_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        display_name = @thread_organization_membership_1.display_name

        assert_equal "#{display_name} changed the title to “has a title.”", @thread.messages.last!.content

        @thread.update!(title: "", event_actor: @thread_organization_membership_1)
        event = @thread.events.updated_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        other_member_count = @thread.organization_memberships.count - 2

        assert_equal "#{display_name} changed the title to “#{display_name} and #{other_member_count} others.”", @thread.messages.last!.content
      end

      test "sends a message about an image change" do
        @thread.update!(image_path: "/foobar.png", event_actor: @thread_organization_membership_2)
        event = @thread.events.updated_action.last!

        assert_difference -> { @thread.messages.count }, 1 do
          event.process!
        end

        assert_equal "#{@thread_organization_membership_2.display_name} changed the image.", @thread.messages.last!.content
        assert_not_nil @thread_membership_2.reload.last_read_at
        assert_nil @thread_membership_1.reload.last_read_at
      end

      test "no-op if no event actor" do
        @thread.update!(image_path: "/foobar.png")
        event = @thread.events.updated_action.last!

        assert_no_difference -> { @thread.messages.count } do
          event.process!
        end
      end
    end
  end
end
