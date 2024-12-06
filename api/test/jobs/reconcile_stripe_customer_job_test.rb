# frozen_string_literal: true

require "test_helper"

class ReconcileStripeCustomerJobTest < ActiveJob::TestCase
  context "perform" do
    test "updates the stripe customer email with an existing stripe_customer_id" do
      org = create(:organization, :billing_email, :stripe_customer)

      Stripe::Customer.expects(:update).with(
        org.stripe_customer_id,
        {
          email: org.billing_email,
          name: org.name,
          description: org.name,
          metadata: {
            public_id: org.public_id,
            db_id: org.id,
          },
        },
      )
      ReconcileStripeCustomerJob.new.perform(org.id)
    end

    test "creates a stripe customer if the org has no stripe_customer_id" do
      org = create(:organization, :billing_email)

      Stripe::Customer.expects(:create).with({
        email: org.billing_email,
        name: org.name,
        description: org.name,
        metadata: {
          public_id: org.public_id,
          db_id: org.id,
        },
      }).returns(Stripe::Customer.new({ id: "str_cus_1" }))

      ReconcileStripeCustomerJob.new.perform(org.id)

      assert_equal "str_cus_1", org.reload.stripe_customer_id
    end
  end
end
