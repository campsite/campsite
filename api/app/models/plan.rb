# frozen_string_literal: true

class Plan
  include ActiveModel::Model

  attr_accessor :name, :stripe_product_ids, :features, :limits

  FEATURES = [
    SMART_DIGESTS_FEATURE = "smart_digests",
    SSO_FEATURE = "organization_sso",
    SYNC_MEMBERS_FEATURE = "sync_members",
    TRUE_UP_ANNUAL_SUBSCRIPTIONS_FEATURE = "true_up_annual_subscriptions",
  ].freeze

  LIMITS = [
    FILE_SIZE_BYTES_LIMIT = "file_size_bytes",
  ].freeze

  NAMES = [
    FREE_NAME = "free",
    LEGACY_NAME = "legacy",
    ESSENTIALS_NAME = "essentials",
    PRO_NAME = "pro",
    BUSINESS_NAME = "business",
  ].freeze

  ALL = [
    new(
      name: FREE_NAME,
      stripe_product_ids: [],
      features: [],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: LEGACY_NAME,
      stripe_product_ids: [
        "prod_N95GumG3qipTDm",
        "prod_MjBeGFtmBgjyPE",
        "prod_Mh8O1AA2WBWtJt",
        "prod_MYPSUoIbrK9KEP",
        "prod_MDMJ1vCyrBaEWd",
        "prod_NwXaMhFaUAbARZ",
      ],
      features: [
        SMART_DIGESTS_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: ESSENTIALS_NAME,
      stripe_product_ids: [
        Rails.env.production? ? "prod_R0regiFS1DirYV" : "prod_R0qvSVuGzRWtZv",
      ],
      features: [
        SMART_DIGESTS_FEATURE,
        SYNC_MEMBERS_FEATURE,
        TRUE_UP_ANNUAL_SUBSCRIPTIONS_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: PRO_NAME,
      stripe_product_ids: [
        Rails.env.production? ? "prod_Nwca1uJddUvdzT" : "prod_Nwb1Fdlpp2Y7Hh",
      ],
      features: [
        SMART_DIGESTS_FEATURE,
        SYNC_MEMBERS_FEATURE,
        TRUE_UP_ANNUAL_SUBSCRIPTIONS_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: BUSINESS_NAME,
      stripe_product_ids: [
        "prod_NwXaMhFaUAbARZ",
        "prod_Nzw7JYAIjtf3lA",
      ],
      features: [
        SMART_DIGESTS_FEATURE,
        SSO_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
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

  def sync_members?
    features.include?(SYNC_MEMBERS_FEATURE)
  end

  def true_up_annual_subscriptions?
    features.include?(TRUE_UP_ANNUAL_SUBSCRIPTIONS_FEATURE)
  end
end
