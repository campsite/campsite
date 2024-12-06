# frozen_string_literal: true

class Poll < ApplicationRecord
  include PublicIdGenerator

  MIN_OPTIONS = 2
  MAX_OPTIONS = 4

  belongs_to :post
  has_many :options, class_name: "PollOption", dependent: :destroy_async
  has_many :votes, through: :options
  has_many :voters, through: :votes, source: :member

  validates :post, uniqueness: true
  validates :options,
    length: { minimum: MIN_OPTIONS, maximum: MAX_OPTIONS, message: "length must be between #{MIN_OPTIONS} and #{MAX_OPTIONS}" },
    on: :update

  def voted?(member)
    voters.include?(member)
  end

  def options_attributes=(options_attrs)
    transaction do
      new_options = options_attrs.map do |option_attrs|
        if option_attrs[:id]
          existing_option = options.find_by!(public_id: option_attrs[:id])
          existing_option.update!(option_attrs.except(:id))
          existing_option
        else
          options.build(option_attrs)
        end
      end

      options.where.not(id: new_options.map(&:id)).destroy_all
      self.options = new_options
      validate!
    end
  end
end
