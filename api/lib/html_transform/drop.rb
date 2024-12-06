# frozen_string_literal: true

class HtmlTransform
  class Drop < Base
    NODE_NAMES = ["script", "style", "link", "meta", "title", "head", "figure", "figcaption", "table", "tr", "td", "th"].freeze

    def plain_text
    end

    def markdown
    end
  end
end
