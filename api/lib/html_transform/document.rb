# frozen_string_literal: true

class HtmlTransform
  class Document < Base
    def plain_text
      children.map(&:plain_text).join.strip
    end

    def markdown
      children.map(&:markdown).join.strip
    end
  end
end
