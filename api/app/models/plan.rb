# frozen_string_literal: true

class Plan
  include ActiveModel::Model

  attr_accessor :name, :features, :limits

  FEATURES = [
    SMART_DIGESTS_FEATURE = "smart_digests",
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
      features: [],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: LEGACY_NAME,
      features: [
        SMART_DIGESTS_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
    new(
      name: ESSENTIALS_NAME,
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
      features: [
        SMART_DIGESTS_FEATURE,
      ],
      limits: {
        FILE_SIZE_BYTES_LIMIT => 1.gigabyte,
      },
    ),
  ].freeze

  ALL_BY_NAME = ALL.index_by(&:name).freeze

  def self.by_name!(name)
    ALL_BY_NAME.fetch(name)
  end

  def sync_members?
    features.include?(SYNC_MEMBERS_FEATURE)
  end

  def true_up_annual_subscriptions?
    features.include?(TRUE_UP_ANNUAL_SUBSCRIPTIONS_FEATURE)
  end
end
