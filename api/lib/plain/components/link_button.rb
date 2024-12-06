# frozen_string_literal: true

module Plain
  module Components
    class LinkButton < BaseComponent
      def initialize(link_button_label:, link_button_url:)
        @link_button_label = link_button_label
        @link_button_url = link_button_url
      end

      def to_h
        {
          componentLinkButton: {
            linkButtonLabel: @link_button_label,
            linkButtonUrl: @link_button_url,
          },
        }
      end
    end
  end
end
