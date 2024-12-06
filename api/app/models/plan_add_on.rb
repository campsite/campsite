# frozen_string_literal: true

class PlanAddOn
  include ActiveModel::Model

  attr_accessor :name, :stripe_product_ids, :features

  NAMES = [
    SSO_NAME = "sso",
  ].freeze

  ALL = [
    new(
      name: SSO_NAME,
      stripe_product_ids: [
        "prod_NwWQ6yJ8mfswYB",
      ],
      features: [
        Plan::SSO_FEATURE,
      ],
    ),
  ].freeze

  ALL_BY_NAME = ALL.index_by(&:name).freeze
  ALL_BY_STRIPE_PRODUCT_ID = ALL.flat_map { |plan| plan.stripe_product_ids.map { |stripe_product_id| [stripe_product_id, plan] } }.to_h.freeze

  def self.by_name!(name)
    ALL_BY_NAME.fetch(name)
  end

  def self.by_stripe_product_id!(stripe_product_id)
    ALL_BY_STRIPE_PRODUCT_ID.fetch(stripe_product_id)
  end
end
