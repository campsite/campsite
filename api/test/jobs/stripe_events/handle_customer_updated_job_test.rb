# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

module StripeEvents
  class HandleCustomerUpdatedJobTest < ActiveJob::TestCase
    include StripeTestHelper

    before(:each) do
      @event = Stripe::Event.construct_from(JSON.parse(file_fixture("stripe/customer_updated_event_payload.json").read, symbolize_names: true))
      @organization = create(:organization, stripe_customer_id: @event.data.object.id)
    end

    context "#perform" do
      test "updates an org's billing email" do
        HandleCustomerUpdatedJob.new.perform(@event.as_json)

        assert_equal @event.data.object.email, @organization.reload.billing_email
      end

      test "no-op when organization not found" do
        @organization.update!(stripe_customer_id: "fake_customer_id")

        assert_no_changes -> { @organization.reload.billing_email } do
          HandleCustomerUpdatedJob.new.perform(@event.as_json)
        end
      end
    end
  end
end
