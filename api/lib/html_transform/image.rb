# frozen_string_literal: true

class HtmlTransform
  class Image < Base
    NODE_NAMES = ["img"].freeze

    def plain_text
      return super unless reaction?

      reaction_text(:plain_text)
    end

    def markdown
      return super unless reaction?

      reaction_text(:markdown)
    end

    private

    def reaction?
      node.attribute("data-type")&.value == "reaction"
    end

    def reaction_text(method)
      ":#{node["data-name"]}:"
    end
  end
end
