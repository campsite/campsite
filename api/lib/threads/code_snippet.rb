# frozen_string_literal: true

module Threads
  class CodeSnippet
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def markdown
      "```\n#{lines.join("\n")}\n```"
    end

    private

    def lines
      data["lines"]
    end
  end
end
