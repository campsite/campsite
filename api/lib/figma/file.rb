# frozen_string_literal: true

module Figma
  class File
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def name
      params["name"]
    end

    def first_page_id
      first_page&.dig("id")
    end

    def first_page_name
      first_page&.dig("name")
    end

    def first_page_type
      first_page&.dig("type")
    end

    private

    def first_page
      params.dig("document", "children")&.first
    end
  end
end
