# frozen_string_literal: true

module StripeTestHelper
  def stripe_subscription(id: "sub_fooBar", status: "active", items: [], cancel_at_period_end: false)
    Stripe::Subscription.construct_from({
      id: id,
      status: status,
      items: Stripe::ListObject.construct_from({
        data: items,
      }),
      cancel_at_period_end: cancel_at_period_end,
    })
  end

  def stripe_subscription_item(id: "si_fooBar", product:, quantity: 1, interval: "month")
    Stripe::SubscriptionItem.construct_from({
      id: id,
      price: Stripe::Price.construct_from({
        product: product,
        recurring: {
          interval: interval,
        },
      }),
      quantity: quantity,
    })
  end
end
