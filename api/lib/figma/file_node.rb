# frozen_string_literal: true

module Figma
  class FileNode
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def id
      params.dig("document", "id")
    end

    def width
      params.dig("document", "absoluteBoundingBox", "width")
    end

    def height
      params.dig("document", "absoluteBoundingBox", "height")
    end

    def name
      params.dig("document", "name")
    end

    def type
      params.dig("document", "type")
    end
  end
end
