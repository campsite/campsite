# frozen_string_literal: true

class UserSubscription < ApplicationRecord
  include PublicIdGenerator

  belongs_to :user
  belongs_to :subscribable, polymorphic: true
end
