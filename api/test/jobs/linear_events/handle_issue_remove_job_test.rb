# frozen_string_literal: true

require "test_helper"

module LinearEvents
  class HandleIssueRemoveJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("linear/issue_remove.json").read)
      @extenal_record = create(:external_record, :linear, remote_record_id: @params["data"]["id"])
      @timeline_event = @extenal_record.timeline_events.create(action: :post_referenced_in_external_record)
    end

    context "perform" do
      test "discards external record along with timeline event" do
        assert_difference -> { ExternalRecord.count }, -1 do
          HandleIssueRemoveJob.new.perform(@params.to_json)
        end

        assert_nil @external_record
        assert_raises(ActiveRecord::RecordNotFound) do
          assert_nil @timeline_event.reload
        end
      end
    end
  end
end
