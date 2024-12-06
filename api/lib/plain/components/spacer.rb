# frozen_string_literal: true

module Plain
  module Components
    class Spacer < BaseComponent
      SPACER_SIZES = ["XS", "S", "M", "L", "XL"]

      def initialize(spacer_size: "M")
        raise ArgumentError, "spacer_size must be one of #{SPACER_SIZES.join(", ")}" unless SPACER_SIZES.include?(spacer_size)

        @spacer_size = spacer_size
      end

      def to_h
        {
          componentSpacer: {
            spacerSize: @spacer_size,
          },
        }
      end
    end
  end
end
