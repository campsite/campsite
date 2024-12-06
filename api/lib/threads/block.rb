# frozen_string_literal: true

module Threads
  class Block
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def content_id
      data["contentID"]
    end

    def parent_id
      data["parentID"]
    end

    def markdown_content_with_code_snippets
      return markdown_content if code_snippets.blank?

      markdown_content.dup.tap do |result|
        code_snippets.each_with_index do |code_snippet, index|
          result.gsub!("<snippet|#{index}>", code_snippet.markdown)
        end
      end
    end

    def attachments
      return [] unless data["attachments"]

      data["attachments"].map { |attachment_data| Attachment.new(attachment_data.to_json) }
    end

    private

    def markdown_content
      data.dig("markdown", "content")
    end

    def code_snippets
      data.dig("markdown", "contentSupplements", "codeSnippets").map { |code_snippet_data| CodeSnippet.new(code_snippet_data.to_json) }
    end
  end
end
