# frozen_string_literal: true

class HtmlTransform
  class List < Base
    NODE_NAMES = ["ol", "ul"].freeze

    def plain_text
      prepend + children.map(&:plain_text).join
    end

    def markdown
      prepend + children.map(&:markdown).join
    end

    private

    def prepend
      node.parent.name == "li" ? "" : "\n"
    end
  end
end
