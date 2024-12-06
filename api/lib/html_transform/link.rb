# frozen_string_literal: true

class HtmlTransform
  class Link < Base
    NODE_NAMES = ["a"].freeze

    def markdown
      return super unless node.attribute("href")

      href = node["href"]
      title = children.map(&:markdown).join
      "[#{title.presence || href}](#{href})"
    end
  end
end
