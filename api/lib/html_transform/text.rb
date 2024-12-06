# frozen_string_literal: true

class HtmlTransform
  class Text < Base
    NODE_NAMES = ["text"].freeze

    def plain_text
      text = node.text
      is_empty = text.strip.empty?

      # ignore indentation whitespace in lists
      return "" if is_empty && (node.parent.name == "ul" || node.parent.name == "ol")

      # strip root whitespace
      return "" if is_empty && root?

      text
        # remove all newlines from text content
        .gsub("\n", "")
        # replace extra whitespace with a single space
        .gsub(/\s+/, " ")
    end

    def markdown
      plain_text
    end
  end
end
