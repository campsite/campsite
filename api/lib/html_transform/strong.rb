# frozen_string_literal: true

class HtmlTransform
  class Strong < Base
    NODE_NAMES = ["strong", "b"].freeze

    def markdown
      "**" + children.map(&:markdown).join + "**"
    end
  end
end
