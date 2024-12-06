# frozen_string_literal: true

class IntegrationTeam < ApplicationRecord
  include PublicIdGenerator

  belongs_to :integration

  before_validation :set_default_metadata

  store_accessor :metadata, :key

  scope :search_name, ->(query_string) { where("integration_teams.name LIKE ?", "%#{query_string}%") }
  scope :not_private, -> { where(private: false) }

  private

  def set_default_metadata
    self.metadata ||= {}
  end
end
