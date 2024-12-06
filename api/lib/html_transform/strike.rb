# frozen_string_literal: true

class HtmlTransform
  class Strike < Base
    NODE_NAMES = ["s"].freeze

    def markdown
      "~~" + children.map(&:markdown).join + "~~"
    end
  end
end
