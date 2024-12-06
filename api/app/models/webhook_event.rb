# frozen_string_literal: true

class WebhookEvent < ApplicationRecord
  include PublicIdGenerator

  belongs_to :webhook
  belongs_to :subject, polymorphic: true
  has_many :deliveries, class_name: "WebhookDelivery"

  validates :event_type, presence: true, inclusion: { in: Webhook::SUPPORTED_EVENTS }
  validates :payload, presence: true

  scope :unresolved, -> { where(status: [:pending, :failing]) }

  enum :status, { pending: 0, delivered: 1, failing: 2, canceled: 3 }

  self.ignored_columns += ["signature"]

  def prepared_payload
    payload.merge(id: public_id)
  end
end
