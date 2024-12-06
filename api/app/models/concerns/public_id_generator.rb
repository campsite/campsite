# frozen_string_literal: true

require "nanoid"

module PublicIdGenerator
  extend ActiveSupport::Concern

  included do
    before_create :set_public_id
  end

  PUBLIC_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"
  PUBLIC_ID_LENGTH = 12
  MAX_RETRY = 1000

  PUBLIC_ID_REGEX = /[#{PUBLIC_ID_ALPHABET}]{#{PUBLIC_ID_LENGTH}}/

  class_methods do
    def generate_public_id(alphabet: PUBLIC_ID_ALPHABET, size: PUBLIC_ID_LENGTH)
      MAX_RETRY.times do
        public_id = Nanoid.generate(size: size, alphabet: alphabet)
        return public_id unless exists?(public_id: public_id)
      end
      raise "Failed to generate a unique public id after #{MAX_RETRY} attempts"
    end
  end

  # Generates a random string for us as the public ID.
  def set_public_id
    return if public_id.present?

    self.public_id = self.class.generate_public_id
  end
end
