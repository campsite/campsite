# frozen_string_literal: true

class HtmlTransform
  class Blockquote < Base
    NODE_NAMES = ["blockquote"].freeze

    def plain_text
      return if context.strip_quotes?

      # strip as blockquotes likely contain paragraphs
      result = children.map(&:plain_text).join.strip
      prepend + "\"#{result}\""
    end

    def markdown
      return if context.strip_quotes?

      # strip as blockquotes likely contain paragraphs
      result = children.map(&:markdown).join.strip
      prepend + result.lines.map { |line| "> #{line}" }.join
    end

    def prepend
      node.parent.name == "blockquote" ? "\n" : "\n\n"
    end
  end
end
