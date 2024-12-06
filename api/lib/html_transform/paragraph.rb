# frozen_string_literal: true

class HtmlTransform
  class Paragraph < Base
    NODE_NAMES = ["p"].freeze

    def plain_text
      prepend + children.map(&:plain_text).join
    end

    def markdown
      prepend + children.map(&:markdown).join
    end

    private

    def prepend
      if root? || node.parent["data-type"] == "detailsContent" || node.parent.name == "details"
        "\n\n"
      elsif node.parent.name == "blockquote"
        "\n"
      else
        ""
      end
    end
  end
end
