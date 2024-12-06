# frozen_string_literal: true

class HtmlTransform
  class ListItem < Base
    NODE_NAMES = ["li"].freeze

    def plain_text
      plain_text_markdown(
        bullet: "•",
        children: children.map(&:plain_text).join,
      )
    end

    def markdown
      plain_text_markdown(
        bullet: "-",
        children: children.map(&:markdown).join,
      )
    end

    def plain_text_markdown(bullet:, children:)
      list_depth = node.ancestors.count { |ancestor| ancestor.name == "ol" || ancestor.name == "ul" }
      indent = "  " * (list_depth - 1)

      prefix = if node.parent.name == "ol"
        start_index = (node.parent["start"] || 1).to_i
        index = node.parent.children.index(node) + start_index

        "#{index}."
      else
        bullet
      end

      "\n#{indent}#{prefix} " + children.strip
    end
  end
end
