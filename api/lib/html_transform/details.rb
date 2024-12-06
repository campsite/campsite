# frozen_string_literal: true

class HtmlTransform
  class Details < Base
    NODE_NAMES = ["details"].freeze

    def plain_text
      "\n\n" + children.map(&:plain_text).join
    end

    def markdown
      "\n\n<details>" + children.map(&:markdown).join + "\n\n</details>"
    end
  end
end
