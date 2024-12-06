# frozen_string_literal: true

module Tokenable
  extend ActiveSupport::Concern

  MAX_RETRY = 1000

  included do
    def tokenable_attribute
      raise NotImplementedError
    end

    def set_tokenable
      attribute = self[tokenable_attribute]
      return if attribute.present?

      assign_attributes({ tokenable_attribute => generate_unique_token(attr_name: tokenable_attribute) })
    end

    def generate_unique_token(attr_name:)
      unique_token = MAX_RETRY.times do
        token = friendly_token
        break token unless self.class.exists?(attr_name => token)
      end

      return unique_token if unique_token

      raise "Failed to generate a unique token after #{MAX_RETRY} attempts"
    end

    def friendly_token(length = 20)
      # To calculate real characters, we must perform this operation.
      # See SecureRandom.urlsafe_base64
      rlength = (length * 3) / 4
      SecureRandom.urlsafe_base64(rlength).tr("lIO0", "sxyz")
    end
  end
end
