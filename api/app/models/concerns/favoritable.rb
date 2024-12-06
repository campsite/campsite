# frozen_string_literal: true

module Favoritable
  extend ActiveSupport::Concern

  included do
    has_many :favorites, as: :favoritable, dependent: :destroy

    def self.viewer_has_favorited_async(ids, membership)
      return AsyncPreloader.value({}) unless membership

      scope = Favorite
        .where(favoritable_type: polymorphic_name)
        .where(favoritable_id: ids)
        .where(organization_membership_id: membership.id)
        .group(:favoritable_id)
        .async_count

      AsyncPreloader.new(scope) { |scope| scope.transform_values { |count| count > 0 } }
    end
  end

  def favoritable_accessory
    nil
  end

  def favoritable_private
    false
  end
end
