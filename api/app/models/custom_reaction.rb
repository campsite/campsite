# frozen_string_literal: true

class CustomReaction < ApplicationRecord
  include ActionView::Helpers::TagHelper
  include PublicIdGenerator
  include ImgixUrlBuilder

  belongs_to :organization
  belongs_to :creator, class_name: "OrganizationMembership", foreign_key: :organization_membership_id

  has_many :reactions, dependent: :destroy

  enum :pack, { blobs: 0, memes: 1, meows: 2, parrots: 3, llamas: 4 }

  validates :name,
    presence: true,
    length: {
      minimum: 2,
      maximum: 100,
      too_short: "should be at least 2 characters",
      too_long: "should be less than 100 characters",
    },
    format: { with: /\A[a-z0-9\-_]+\z/, message: "must be lowercase and can only contain limited punctuation marks" },
    uniqueness: { scope: :organization },
    exclusion: { in: EmojiMart.ids, message: "already exists as a system emoji" }

  def file_url
    build_imgix_url(file_path)
  end

  def to_html
    tag(:img, src: file_url, alt: name, draggable: false, data: { type: "reaction", id: public_id, name: name })
  end
end
