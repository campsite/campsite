# frozen_string_literal: true

class HtmlTransform
  class Italic < Base
    NODE_NAMES = ["em", "i"].freeze

    def markdown
      "_" + children.map(&:markdown).join + "_"
    end
  end
end
