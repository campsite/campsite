# frozen_string_literal: true

module Plain
  module Components
    class Row < BaseComponent
      def initialize(row_main_content:, row_aside_content:)
        raise ArgumentError, "row_main_content must be an array of or instance of Plain::Components::BaseComponent" unless Array(row_main_content).all? { |c| c.is_a?(BaseComponent) }
        raise ArgumentError, "row_aside_content must be an array of or instance of Plain::Components::BaseComponent" unless Array(row_aside_content).all? { |c| c.is_a?(BaseComponent) }

        @row_main_content = row_main_content
        @row_aside_content = row_aside_content
      end

      def to_h
        {
          componentRow: {
            rowMainContent: Array(@row_main_content).map(&:to_h),
            rowAsideContent: Array(@row_aside_content).map(&:to_h),
          },
        }
      end
    end
  end
end
