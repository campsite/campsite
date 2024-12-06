# frozen_string_literal: true

require "test_helper"

class SyncSlackChannelsV2JobTest < ActiveJob::TestCase
  setup do
    @integration = create(:integration, :slack)
    @scopes = create(:slack_scopes, integration: @integration)
    @organization = @integration.owner
    @public_channel_id = "C012AB3CD"
    @public_channel_name = "general"
    @private_channel_id = "C061EG9T2"
    @private_channel_name = "random"

    @result_page_1 = {
      "ok" => true,
      "channels" => [
        {
          "id" => @public_channel_id,
          "name" => @public_channel_name,
          "is_channel" => true,
          "is_group" => false,
          "is_im" => false,
          "created" => 1449252889,
          "creator" => "U012A3CDE",
          "is_archived" => false,
          "is_general" => true,
          "unlinked" => 0,
          "name_normalized" => "general",
          "is_shared" => false,
          "is_ext_shared" => false,
          "is_org_shared" => false,
          "pending_shared" => [],
          "is_pending_ext_shared" => false,
          "is_member" => true,
          "is_private" => false,
          "is_mpim" => false,
          "updated" => 1678229664302,
          "topic" => {
            "value" => "Company-wide announcements and work-based matters",
            "creator" => "",
            "last_set" => 0,
          },
          "purpose" => {
            "value" => "This channel is for team-wide communication and announcements. All team members are in this channel.",
            "creator" => "",
            "last_set" => 0,
          },
          "previous_names" => [],
          "num_members" => 4,
        },
      ],
      "response_metadata" => {
        "next_cursor" => "dGVhbTpDMDYxRkE1UEI=",
      },
    }

    @result_page_2 = {
      "ok" => true,
      "channels" => [
        {
          "id" => @private_channel_id,
          "name" => @private_channel_name,
          "is_channel" => true,
          "is_group" => false,
          "is_im" => false,
          "created" => 1449252889,
          "creator" => "U061F7AUR",
          "is_archived" => false,
          "is_general" => false,
          "unlinked" => 0,
          "name_normalized" => "random",
          "is_shared" => false,
          "is_ext_shared" => false,
          "is_org_shared" => false,
          "pending_shared" => [],
          "is_pending_ext_shared" => false,
          "is_member" => true,
          "is_private" => true,
          "is_mpim" => false,
          "updated" => 1678229664302,
          "topic" => {
            "value" => "Non-work banter and water cooler conversation",
            "creator" => "",
            "last_set" => 0,
          },
          "purpose" => {
            "value" => "A place for non-work-related flimflam, faffing, hodge-podge or jibber-jabber you'd prefer to keep out of more focused work-related channels.",
            "creator" => "",
            "last_set" => 0,
          },
          "previous_names" => [],
          "num_members" => 4,
        },
      ],
      "response_metadata" => {
        "next_cursor" => "",
      },
    }
  end

  context "#perform" do
    test "updates channels from first page of results + enqueues job for next page" do
      Slack::Web::Client.any_instance.expects(:conversations_list)
        .with({
          exclude_archived: true,
          types: "public_channel,private_channel",
          limit: 1000,
        })
        .returns(@result_page_1)

      Timecop.freeze do
        updated_channel = create(:integration_channel, integration: @integration, provider_channel_id: @public_channel_id, name: "old-name")

        SyncSlackChannelsV2Job.new.perform(@integration.id)

        assert_in_delta Time.current, @integration.reload.channels_last_synced_at, 2.seconds
        assert_equal @public_channel_name, updated_channel.reload.name
        assert_enqueued_sidekiq_job(SyncSlackChannelsV2Job, args: [@integration.id, @result_page_1.dig("response_metadata", "next_cursor")])
      end
    end

    test "updates channels from last page of results + deletes unfound channels" do
      Slack::Web::Client.any_instance.expects(:conversations_list)
        .with({
          exclude_archived: true,
          types: "public_channel,private_channel",
          limit: 1000,
          cursor: @result_page_1.dig("response_metadata", "next_cursor"),
        })
        .returns(@result_page_2)

      Timecop.freeze do
        @integration.find_or_initialize_data(IntegrationData::CHANNELS_LAST_SYNCED_AT).update!(value: 3.minutes.ago.iso8601)
        old_channel = create(:integration_channel, integration: @integration, updated_at: 4.minutes.ago)
        recently_updated_channel = create(:integration_channel, integration: @integration, updated_at: 3.minutes.ago)

        SyncSlackChannelsV2Job.new.perform(@integration.id, @result_page_1.dig("response_metadata", "next_cursor"))

        assert_not IntegrationChannel.exists?(id: old_channel.id)
        assert IntegrationChannel.exists?(id: recently_updated_channel.id)
        private_channel = @integration.channels.find_by!(provider_channel_id: @private_channel_id)
        assert_equal @private_channel_name, private_channel.name
        assert_predicate private_channel, :private?
        assert_enqueued_sidekiq_job(SyncSlackChannelMembersJob, args: [private_channel.id])
        refute_enqueued_sidekiq_job(SyncSlackChannelsV2Job)
      end
    end

    test "doesn't request private channels if integration is missing groups:read scope" do
      @scopes.update!(value: (@scopes.value.split(",") - ["groups:read"]).join(","))
      Slack::Web::Client.any_instance.expects(:conversations_list).with(has_entry(:types, "public_channel")).returns(@result_page_1)

      SyncSlackChannelsV2Job.new.perform(@integration.id)
    end

    test "does not sync Slack channels if synced in the past 2 minutes" do
      Slack::Web::Client.any_instance.stubs(:conversations_list).returns(@result_page_1)

      Timecop.travel(1.minute.ago) do
        @integration.channels_synced!
      end

      assert_no_difference -> { @organization.reload.slack_channels.count } do
        SyncSlackChannelsV2Job.new.perform(@integration.id)
      end
    end

    test "schedules retry job for future when rate limited" do
      next_cursor = "foobar"

      Timecop.freeze do
        retry_after = 30
        Slack::Web::Client.any_instance.stubs(:conversations_list)
          .raises(Slack::Web::Api::Errors::TooManyRequestsError.new(OpenStruct.new(headers: { "retry-after" => retry_after }))) # rubocop:disable Style/OpenStructUse

        SyncSlackChannelsV2Job.new.perform(@integration.id, next_cursor)

        assert_enqueued_sidekiq_job(SyncSlackChannelsV2Job, args: [@integration.id, next_cursor], perform_in: 30)
      end
    end
  end
end
