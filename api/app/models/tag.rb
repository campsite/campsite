# frozen_string_literal: true

class Tag < ApplicationRecord
  include PublicIdGenerator

  belongs_to :organization

  ORG_DEFAULT_TAGS = [
    "wip",
    "shipped",
    "a11y",
    "rfc",
    "feedback",
    "prototype",
  ].freeze

  has_many :post_taggings, dependent: :destroy_async
  has_many :kept_published_posts, -> { kept.with_published_state }, through: :post_taggings, source: :post, class_name: "Post"

  validates :name,
    presence: true,
    format: {
      with: /\A[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]\z/,
      message: "can only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
    },
    length: {
      minimum: 2,
      maximum: 32,
      too_long: "should be less than 32 characters.",
    },
    uniqueness: { scope: :organization }

  scope :search_by, ->(query_string) do
    where("tags.name LIKE ?", "%#{query_string}%")
  end

  def url(organization = nil)
    organization ||= self.organization
    "#{organization.url}/tags/#{name}"
  end

  def api_type_name
    "Tag"
  end
end
