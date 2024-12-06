# frozen_string_literal: true

class HtmlTransform
  class LinkUnfurl < Base
    NODE_NAMES = ["link-unfurl"].freeze

    def plain_text
      "\n\n#{node["href"]}"
    end

    def markdown
      if context.export?
        href = node["href"]
        "\n\n[#{href}](#{href})"
      else
        "\n\n#{node}"
      end
    end
  end
end
