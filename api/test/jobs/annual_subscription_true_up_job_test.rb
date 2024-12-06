# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

class AnnualSubscriptionTrueUpJobTest < ActiveJob::TestCase
  include StripeTestHelper

  setup do
    @organization = create(:organization, :stripe_customer, plan_name: Plan::PRO_NAME)
    @subscription = stripe_subscription
  end

  describe "#perform" do
    test "schedules an invoice and sends an email when organization is due for a true-up invoice" do
      Timecop.freeze do
        stub_most_recent_invoice_creation_time(4.months.ago)
        stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS, created: 3.months.from_now)

        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)

        scheduled_subscription_invoice = @organization.scheduled_subscription_invoices.first!
        assert_in_delta 1.week.from_now, scheduled_subscription_invoice.scheduled_for, 2.seconds
        assert_equal @subscription.id, scheduled_subscription_invoice.stripe_subscription_id
        assert_not_predicate scheduled_subscription_invoice, :payment_attempted?
        assert_enqueued_email_with ScheduledSubscriptionInvoiceMailer, :preview, args: [scheduled_subscription_invoice, ActionController::Base.helpers.number_to_currency(AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS / 100.0)]
      end
    end

    test "does not schedule an invoice when organization is on the legacy plan" do
      stub_most_recent_invoice_creation_time(4.months.ago)
      stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS, created: 3.months.from_now)
      @organization.update!(plan_name: Plan::LEGACY_NAME)

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices, :none?
    end

    test "does not scheduled an invoice when organization already has a scheduled invoice" do
      stub_most_recent_invoice_creation_time(4.months.ago)
      stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS, created: 3.months.from_now)
      existing = create(:scheduled_subscription_invoice, organization: @organization)

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices.excluding(existing), :none?
    end

    test "schedules an invoice when organization has a scheduled invoice that has already been attempted" do
      Timecop.freeze do
        stub_most_recent_invoice_creation_time(4.months.ago)
        stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS, created: 3.months.from_now)
        existing = create(:scheduled_subscription_invoice, :payment_attempted, organization: @organization)

        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)

        scheduled_subscription_invoice = @organization.scheduled_subscription_invoices.excluding(existing).first!
        assert_in_delta 1.week.from_now, scheduled_subscription_invoice.scheduled_for, 2.seconds
        assert_not_predicate scheduled_subscription_invoice, :payment_attempted?
        assert_enqueued_email_with ScheduledSubscriptionInvoiceMailer, :preview, args: [scheduled_subscription_invoice, ActionController::Base.helpers.number_to_currency(AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS / 100.0)]
      end
    end

    test "does not schedule an invoice when organization recently invoiced" do
      stub_most_recent_invoice_creation_time(2.months.ago)
      stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS, created: 3.months.from_now)

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices, :none?
    end

    test "does not schedule an invoice when organization has no upcoming invoice" do
      stub_most_recent_invoice_creation_time(4.months.ago)
      Stripe::Invoice.expects(:upcoming).raises(Stripe::InvalidRequestError.new("No upcoming invoices for customer: #{@organization.stripe_customer_id}", nil))

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices, :none?
    end

    test "does not schedule an invoice when no prorated amount owed" do
      stub_most_recent_invoice_creation_time(4.months.ago)
      stub_upcoming_invoice(amount: 0, created: 3.months.from_now)

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices, :none?
    end

    test "does not schedule an invoice if prorated amount owed is below threshold" do
      stub_most_recent_invoice_creation_time(4.months.ago)
      stub_upcoming_invoice(amount: AnnualSubscriptionTrueUpJob::TRUE_UP_THRESHOLD_IN_CENTS - 1, created: 3.months.from_now)

      assert_no_enqueued_emails do
        AnnualSubscriptionTrueUpJob.new.perform(@organization.id, @subscription.id)
      end

      assert_predicate @organization.scheduled_subscription_invoices, :none?
    end
  end

  def stub_most_recent_invoice_creation_time(time)
    Stripe::Invoice.stubs(:list).returns(Stripe::ListObject.construct_from({
      data: [
        Stripe::Invoice.construct_from({ created: time.to_i }),
      ],
    }))
  end

  def stub_upcoming_invoice(amount:, created:)
    # When retrieving an upcoming invoice, you’ll get a lines property containing the total count
    # of line items and the first handful of those items. There is also a URL where you can
    # retrieve the full (paginated) list of line items.
    #
    # https://stripe.com/docs/api/invoices/upcoming

    zero_dollar_invoice_line_item = Stripe::InvoiceLineItem.construct_from({
      id: "il_tmp_#{SecureRandom.hex(10)}}",
      amount: 0,
      proration: true,
    })

    Stripe::Invoice.stubs(:upcoming).returns(Stripe::Invoice.construct_from({
      created: 3.months.from_now.to_i,
      lines: Stripe::ListObject.construct_from({
        data: Array.new(10, zero_dollar_invoice_line_item),
        has_more: true,
      }),
    }))

    Stripe::Invoice.stubs(:list_upcoming_line_items).with(Not(has_key(:starting_after))).returns(Stripe::ListObject.construct_from({
      data: Array.new(10, zero_dollar_invoice_line_item),
      has_more: true,
    }))

    Stripe::Invoice.stubs(:list_upcoming_line_items).with(has_key(:starting_after)).returns(Stripe::ListObject.construct_from({
      data: [
        Stripe::InvoiceLineItem.construct_from({
          id: "il_tmp_#{SecureRandom.hex(10)}}",
          amount: amount,
          proration: true,
        }),
      ],
      has_more: false,
    }))
  end
end
