# frozen_string_literal: true

class HtmlTransform
  class Passthrough < Base
    def plain_text
      node.to_s
    end

    def markdown
      node.to_s
    end
  end
end
