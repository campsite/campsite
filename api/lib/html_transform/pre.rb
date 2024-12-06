# frozen_string_literal: true

class HtmlTransform
  class Pre < Base
    NODE_NAMES = ["pre"].freeze

    def plain_text
      "\n\n" + children_text(:plain_text)
    end

    def markdown
      "\n\n```\n" + children_text(:markdown) + "\n```"
    end

    private

    # custom implementation to handle code and text nodes
    def children_text(method)
      node.children.map do |child|
        case child.name
        when "code", "text"
          child.text.strip
        when "br"
          "\n"
        else
          handler(child).new(node: child, context: context).public_send(method)
        end
      end.join
    end
  end
end
