# frozen_string_literal: true

require "csv"

class LegacySubscriptionsReport
  COLUMN_TITLES_BY_ID = {
    name: "Organization name",
    billing_email: "Billing email",
    active_member_count: "Active member count",
    stripe_subscription_url: "Stripe subscription URL",
    stripe_product_name: "Stripe product name",
    formatted_stripe_price_unit_amount: "Stripe price unit amount",
    stripe_subscription_item_quantity: "Stripe subscription item quantity",
    stripe_price_interval: "Stripe price interval",
    formatted_current_cost_per_interval: "Cost per interval on legacy plan",
    formatted_pro_cost_per_interval: "Cost per interval on Pro plan",
    formatted_savings_per_interval: "Savings per interval on Pro plan",
  }

  class << self
    def run
      rows = [COLUMN_TITLES_BY_ID.values]

      rows += Organization.where(plan_name: Plan::LEGACY_NAME).map do |organization|
        data = OrganizationReportData.new(organization)
        next unless data.stripe_subscription

        COLUMN_TITLES_BY_ID.keys.map do |column_id|
          data.public_send(column_id)
        end
      end.compact

      csv = CSV.generate do |csv|
        rows.each do |row|
          csv << row
        end
      end

      Rails.logger.debug(csv)

      nil
    end
  end

  class OrganizationReportData
    # rubocop:disable Style/ClassVars
    @@stripe_products_by_id = {}
    @@stripe_prices_by_id = {}
    # rubocop:enable Style/ClassVars

    include ActionView::Helpers::NumberHelper

    def initialize(organization)
      @organization = organization
    end

    attr_reader :organization

    delegate :name, :billing_email, :active_member_count, to: :organization
    delegate :name, to: :stripe_product, prefix: true
    delegate :quantity, to: :stripe_subscription_item, prefix: true
    delegate :unit_amount, to: :stripe_price, prefix: true

    def stripe_subscription_url
      "https://dashboard.stripe.com/subscriptions/#{stripe_subscription.id}"
    end

    def stripe_price_interval
      stripe_price.recurring.interval
    end

    def formatted_stripe_price_unit_amount
      number_to_currency(stripe_price_unit_amount / 100.0)
    end

    def formatted_current_cost_per_interval
      number_to_currency(current_cost_per_interval / 100.0)
    end

    def formatted_pro_cost_per_interval
      number_to_currency(pro_cost_per_interval / 100.0)
    end

    def formatted_savings_per_interval
      number_to_currency(savings_per_interval / 100.0)
    end

    def stripe_subscription
      return @stripe_subscription if defined?(@stripe_subscription)

      subscriptions = Stripe::Subscription.list(customer: stripe_customer.id).to_a
      raise "#{organization.name} has multiple subscriptions" if subscriptions.size > 1

      @stripe_subscription ||= subscriptions.first
    end

    private

    def stripe_subscription_item
      return @stripe_subscription_item if defined?(@stripe_subscription_item)

      plan_items = stripe_subscription.items.data.select { |item| Plan::ALL_BY_STRIPE_PRODUCT_ID.key?(item.price.product) }
      raise "#{organization.name} has multiple subscription items" if plan_items.size > 1

      @stripe_subscription_item ||= plan_items.first
    end

    def stripe_price
      return @stripe_price if defined?(@stripe_price)

      @stripe_price = if @@stripe_prices_by_id[stripe_subscription_item.price.id]
        @@stripe_prices_by_id[stripe_subscription_item.price.id]
      else
        @@stripe_prices_by_id[stripe_subscription_item.price.id] = Stripe::Price.retrieve({ id: stripe_subscription_item.price.id, expand: ["tiers"] })
      end
    end

    def stripe_price_unit_amount
      return stripe_price.unit_amount if stripe_price.unit_amount

      # https://dashboard.stripe.com/prices/price_1LUvb6LhPxZt87OmqqmtrrcY has tiers that all have the same unit price 🤷‍♂️
      stripe_price.tiers.first.unit_amount
    end

    def stripe_product
      return @stripe_product if defined?(@stripe_product)

      @stripe_product = if @@stripe_products_by_id[stripe_price.product]
        @@stripe_products_by_id[stripe_price.product]
      else
        @@stripe_products_by_id[stripe_price.product] = Stripe::Product.retrieve(stripe_price.product)
      end
    end

    def stripe_customer
      @stripe_customer ||= Stripe::Customer.retrieve(organization.stripe_customer_id)
    end

    def current_cost_per_interval
      stripe_price_unit_amount * stripe_subscription_item_quantity
    end

    def pro_cost_per_interval
      case stripe_price_interval
      when "month"
        10_00 * active_member_count
      when "year"
        96_00 * active_member_count
      end
    end

    def savings_per_interval
      current_cost_per_interval - pro_cost_per_interval
    end
  end
end
