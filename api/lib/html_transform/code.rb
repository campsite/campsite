# frozen_string_literal: true

class HtmlTransform
  # code blocks are handled by Pre
  class Code < Base
    NODE_NAMES = ["code"].freeze

    def plain_text
      node.text
    end

    def markdown
      "`#{node.text}`"
    end
  end
end
