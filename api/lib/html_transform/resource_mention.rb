# frozen_string_literal: true

class HtmlTransform
  class ResourceMention < Base
    NODE_NAMES = ["resource-mention"].freeze

    def plain_text
      href = node["href"]
      return href if context.resource_mention_map.blank?

      context.resource_mention_map[href] || href
    end

    def markdown
      if context.export?
        href = node["href"]
        "[#{href}](#{href})"
      else
        node.to_s
      end
    end
  end
end
