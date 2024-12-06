# frozen_string_literal: true

class HtmlTransform
  class Base
    def initialize(node:, context:)
      @node = node
      @context = context
    end

    attr_reader :node, :context

    def handler(node)
      HANDLERS_BY_NODE_NAMES[node.name] || HtmlTransform::Base
    end

    def children
      node.children.map do |child|
        handler(child).new(node: child, context: context)
      end
    end

    def root?
      node.parent.name == "#document-fragment"
    end

    def plain_text
      children.map(&:plain_text).join
    end

    def markdown
      children.map(&:markdown).join
    end
  end
end
