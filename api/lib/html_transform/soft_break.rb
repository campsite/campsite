# frozen_string_literal: true

class HtmlTransform
  class SoftBreak < Base
    NODE_NAMES = ["br"].freeze

    def plain_text
      "\n"
    end

    def markdown
      "\n"
    end
  end
end
