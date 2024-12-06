# frozen_string_literal: true

module Tenor
  class GifNodes
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def next_cursor
      params["next"]
    end

    def data
      params["results"].map { |gif_params| Tenor::GifNode.new(gif_params) }
    end
  end
end
