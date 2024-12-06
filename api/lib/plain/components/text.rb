# frozen_string_literal: true

module Plain
  module Components
    class Text < BaseComponent
      TEXT_COLORS = ["NORMAL", "MUTED", "SUCCESS", "WARNING", "ERROR"]

      def initialize(text:, text_color: "NORMAL")
        raise ArgumentError, "text_color must be one of #{TEXT_COLORS.join(", ")}" unless TEXT_COLORS.include?(text_color)

        @text = text
        @text_color = text_color
      end

      def to_h
        {
          componentText: {
            text: @text,
            textColor: @text_color,
          },
        }
      end
    end
  end
end
