# frozen_string_literal: true

class HtmlTransform
  class Summary < Base
    NODE_NAMES = ["summary"].freeze

    def plain_text
      "\n\n" + children.map(&:plain_text).join
    end

    def markdown
      "\n\n<summary>" + children.map(&:markdown).join + "</summary>"
    end
  end
end
