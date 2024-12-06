# frozen_string_literal: true

class PostLinkPreview < ApplicationRecord
  include PublicIdGenerator

  belongs_to :post

  validates :service_name, :title, :url, presence: true

  before_save { service_name.downcase! }

  def api_type_name
    "PostLinkPreview"
  end
end
