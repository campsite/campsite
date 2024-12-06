# frozen_string_literal: true

class ProductLog < ApplicationRecord
  belongs_to :subject, polymorphic: true
end
