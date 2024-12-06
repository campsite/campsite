# frozen_string_literal: true

module Tenor
  class GifNode
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def id
      params["id"]
    end

    def description
      params["content_description"]
    end

    def url
      tiny_gif["url"]
    end

    def width
      tiny_gif["dims"][0]
    end

    def height
      tiny_gif["dims"][1]
    end

    private

    def tiny_gif
      params["media_formats"]["tinygif"]
    end
  end
end
