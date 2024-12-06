# frozen_string_literal: true

module Plain
  module Components
    class PlainText < BaseComponent
      def initialize(plain_text:)
        @plain_text = plain_text
      end

      def to_h
        {
          componentPlainText: {
            plainText: @plain_text,
          },
        }
      end
    end
  end
end
