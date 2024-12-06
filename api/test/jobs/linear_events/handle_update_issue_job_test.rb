# frozen_string_literal: true

require "test_helper"

module LinearEvents
  class HandleIssueUpdateJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("linear/issue_payload.json").read)
      @external_record = create(:external_record, :linear, remote_record_id: @params["data"]["id"])
    end

    context "perform" do
      test "updates matching ExternalRecords" do
        HandleIssueUpdateJob.new.perform(@params.to_json)

        assert_equal @params["data"]["title"], @external_record.reload.remote_record_title
      end
    end
  end
end
