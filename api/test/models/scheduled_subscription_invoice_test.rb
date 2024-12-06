# frozen_string_literal: true

require "test_helper"

class ScheduledSubscriptonInvoiceTest < ActiveSupport::TestCase
  context "validations" do
    test "prevents an org from having multiple no-payment-attempted scheduled invoices" do
      organization = create(:organization)
      create(:scheduled_subscription_invoice, organization: organization)

      assert_raises ActiveRecord::RecordInvalid do
        create(:scheduled_subscription_invoice, organization: organization)
      end
    end

    test "allows an org to have a scheduled invoice if payment was attempted on all previous scheduled invoices" do
      organization = create(:organization)
      create(:scheduled_subscription_invoice, :payment_attempted, organization: organization)

      assert_nothing_raised do
        create(:scheduled_subscription_invoice, organization: organization)
      end
    end
  end
end
