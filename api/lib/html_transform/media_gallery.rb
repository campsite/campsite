# frozen_string_literal: true

class HtmlTransform
  class MediaGallery < Base
    NODE_NAMES = ["media-gallery"].freeze

    def plain_text
      nil
    end

    def markdown
      result = if context.export?
        node.css("media-gallery-item").map do |node|
          extension = node[:file_type].split("/").last
          id = node[:id]
          if node[:file_type].starts_with?("image")
            "![#{id}](#{id}.#{extension})"
          else
            "[#{id}](#{id}.#{extension})"
          end
        end.join("\n\n")
      else
        node
      end

      "\n\n#{result}"
    end
  end
end
