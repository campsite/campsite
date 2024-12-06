# frozen_string_literal: true

class AnnualSubscriptionTrueUpJob < BaseJob
  TRUE_UP_THRESHOLD_IN_CENTS = 50_00

  sidekiq_options queue: "within_30_minutes"

  def perform(organization_id, stripe_subscription_id)
    @organization = Organization.find(organization_id)
    @stripe_subscription_id = stripe_subscription_id

    return unless @organization.true_up_annual_subscriptions?
    return unless @organization.stripe_customer_id
    return if !most_recent_invoice || Time.zone.at(most_recent_invoice.created).after?(3.months.ago)
    return if !upcoming_invoice || Time.zone.at(upcoming_invoice.created).before?(2.months.from_now)
    return if proration_amount_in_cents < TRUE_UP_THRESHOLD_IN_CENTS
    return if @organization.scheduled_subscription_invoices.no_payment_attempted.exists?

    scheduled_subscription_invoice = @organization.scheduled_subscription_invoices.create!(
      scheduled_for: 1.week.from_now,
      stripe_subscription_id: stripe_subscription_id,
    )

    ScheduledSubscriptionInvoiceMailer.preview(scheduled_subscription_invoice, formatted_proration_amount).deliver_later
  rescue ActiveRecord::RecordNotFound => e
    Sentry.capture_exception(e)
  end

  def most_recent_invoice
    return @most_recent_invoice if defined?(@most_recent_invoice)

    @most_recent_invoice = Stripe::Invoice.list({
      customer: @organization.stripe_customer_id,
      subscription: @stripe_subscription_id,
      limit: 1,
    })&.data&.first
  end

  def upcoming_invoice
    return @upcoming_invoice if defined?(@upcoming_invoice)

    @upcoming_invoice = Stripe::Invoice.upcoming({
      customer: @organization.stripe_customer_id,
      subscription: @stripe_subscription_id,
      subscription_proration_date: Time.current.to_i,
    })
  rescue Stripe::InvalidRequestError => e
    Sentry.capture_exception(e)
    @upcoming_invoice = nil
  end

  def upcoming_invoice_line_items
    return @upcoming_invoice_line_items if defined?(@upcoming_invoice_line_items)

    items = []
    starting_after = nil
    has_more = true

    while has_more
      response = Stripe::Invoice.list_upcoming_line_items({
        customer: @organization.stripe_customer_id,
        subscription: @stripe_subscription_id,
        subscription_proration_date: Time.current.to_i,
      }.tap { |params| params[:starting_after] = starting_after if starting_after })

      items += response.data
      starting_after = response.data.last.id
      has_more = response.has_more
    end

    @upcoming_invoice_line_items = items
  rescue Stripe::InvalidRequestError => e
    Sentry.capture_exception(e)
    @upcoming_invoice_line_items = []
  end

  def proration_amount_in_cents
    @proration_amount_in_cents ||= upcoming_invoice_line_items.select(&:proration?).sum(&:amount)
  end

  def formatted_proration_amount
    @formatted_proration_amount ||= String.new(ActionController::Base.helpers.number_to_currency(proration_amount_in_cents / 100.0))
  end
end
