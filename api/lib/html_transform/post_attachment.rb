# frozen_string_literal: true

class HtmlTransform
  class PostAttachment < Base
    NODE_NAMES = ["post-attachment"].freeze

    def plain_text
      nil
    end

    def markdown
      result = if context.export?
        extension = node[:file_type].split("/").last
        id = node[:id]
        if node[:file_type].starts_with?("image")
          "![#{id}](#{id}.#{extension})"
        else
          "[#{id}](#{id}.#{extension})"
        end
      else
        node
      end

      "\n\n#{result}"
    end
  end
end
