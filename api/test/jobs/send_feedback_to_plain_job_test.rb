# frozen_string_literal: true

require "test_helper"

class SendFeedbackToPlainJobTest < ActiveJob::TestCase
  context "perform" do
    test "it creates a Plain thread" do
      feedback = create(:feedback)

      PlainClient.any_instance.expects(:upsert_customer)
      PlainClient.any_instance.expects(:create_thread)

      SendFeedbackToPlainJob.new.perform(feedback.id)
    end

    test "it updates customer with matching email and no external_id" do
      feedback = create(:feedback)

      PlainClient.any_instance.stubs(:upsert_customer).raises(PlainClient::CustomerAlreadyExistsWithEmailError).then.returns(nil)
      PlainClient.any_instance.expects(:create_thread)

      SendFeedbackToPlainJob.new.perform(feedback.id)
    end
  end
end
