# frozen_string_literal: true

class ScheduledSubscriptionInvoice < ApplicationRecord
  belongs_to :organization

  # Prevent multiple no-payment-attempted scheduled invoices for the same organization
  validates :payment_attempted_at, uniqueness: { scope: :organization_id }

  scope :due, -> { no_payment_attempted.where(scheduled_for: ..Time.current) }
  scope :no_payment_attempted, -> { where(payment_attempted_at: nil) }

  def due?
    !payment_attempted? && scheduled_for.before?(Time.current)
  end

  def payment_attempted?
    !!payment_attempted_at
  end
end
