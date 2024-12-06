# frozen_string_literal: true

class HtmlTransform
  class Input < Base
    NODE_NAMES = ["input"].freeze

    def markdown
      return super unless node.attribute("type")&.value == "checkbox"

      checked = node.attribute("checked").present? ? "x" : " "
      "[#{checked}] "
    end
  end
end
