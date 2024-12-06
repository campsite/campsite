# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

class SubscriptionInvoiceJobTest < ActiveJob::TestCase
  setup do
    @scheduled_subscription_invoice = create(:scheduled_subscription_invoice, :due)
    @organization = @scheduled_subscription_invoice.organization
  end

  describe "#perform" do
    test "drafts and pays a scheduled invoice" do
      Timecop.freeze do
        expected_args = {
          customer: @organization.stripe_customer_id,
          subscription: @scheduled_subscription_invoice.stripe_subscription_id,
          auto_advance: true,
        }
        Stripe::Invoice.expects(:create).with(expected_args)

        SubscriptionInvoiceJob.new.perform(@scheduled_subscription_invoice.id)
        assert_in_delta Time.current, @scheduled_subscription_invoice.reload.payment_attempted_at, 2.seconds
      end
    end

    test "does not draft a not-due invoice" do
      not_due = create(:scheduled_subscription_invoice, :not_due)
      Stripe::Invoice.expects(:create).never

      SubscriptionInvoiceJob.new.perform(not_due.id)
    end

    test "does not draft a payment-attempted invoice" do
      payment_attempted = create(:scheduled_subscription_invoice, :payment_attempted)
      Stripe::Invoice.expects(:create).never

      SubscriptionInvoiceJob.new.perform(payment_attempted.id)
    end
  end
end
