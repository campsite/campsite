# frozen_string_literal: true

class HtmlTransform
  class Span < Base
    NODE_NAMES = ["span"].freeze

    def plain_text
      case data_type
      when "reaction"
        reaction_text(:plain_text)
      when "mention"
        node.text
      else
        super
      end
    end

    def markdown
      case data_type
      when "reaction"
        reaction_text(:markdown)
      when "mention"
        "<@#{node.attribute("data-id")}>"
      else
        super
      end
    end

    private

    def data_type
      node.attribute("data-type")&.value
    end

    def reaction_text(method)
      children.map { |c| c.public_send(method) }.join
    end
  end
end
