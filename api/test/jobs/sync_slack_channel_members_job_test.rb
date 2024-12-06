# frozen_string_literal: true

require "test_helper"

class SyncSlackChannelMemberssJobTest < ActiveJob::TestCase
  setup do
    @integration = create(:integration, :slack)
    @channel = create(:integration_channel, integration: @integration)
    @organization = @integration.owner

    @result_page_1 = {
      "ok" => true,
      "members" => [
        "U023BECGF",
        "U061F7AUR",
      ],
      "response_metadata" => {
        "next_cursor" => "dGVhbTpDMDYxRkE1UEI=",
      },
    }

    @result_page_2 = {
      "ok" => true,
      "members" => [
        "W012A3CDE",
      ],
      "response_metadata" => {
        "next_cursor" => "",
      },
    }
  end

  context "#perform" do
    test "creates new IntegrationChannelMember records" do
      Slack::Web::Client.any_instance.expects(:conversations_members).with(has_entries(channel: @channel.provider_channel_id, limit: 1000)).twice.returns(@result_page_1, @result_page_2)

      old_member = create(:integration_channel_member, integration_channel: @channel, provider_member_id: "no-longer-exists")

      SyncSlackChannelMembersJob.new.perform(@channel.id)

      assert_equal 3, @channel.members.count
      assert_not IntegrationChannelMember.exists?(id: old_member.id)
      assert IntegrationChannelMember.exists?(integration_channel: @channel, provider_member_id: @result_page_1["members"][0])
      assert IntegrationChannelMember.exists?(integration_channel: @channel, provider_member_id: @result_page_1["members"][1])
      assert IntegrationChannelMember.exists?(integration_channel: @channel, provider_member_id: @result_page_2["members"][0])
    end

    test "sleeps and retries when rate limited" do
      retry_after = 30
      SyncSlackChannelMembersJob.any_instance.expects(:sleep).with(retry_after)
      Slack::Web::Client.any_instance.stubs(:conversations_members)
        .raises(Slack::Web::Api::Errors::TooManyRequestsError.new(OpenStruct.new(headers: { "retry-after" => retry_after }))) # rubocop:disable Style/OpenStructUse
        .returns(@result_page_1, @result_page_2)

      SyncSlackChannelMembersJob.new.perform(@channel.id)

      assert_equal 3, @channel.members.count
    end
  end
end
