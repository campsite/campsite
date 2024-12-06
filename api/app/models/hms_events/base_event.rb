# frozen_string_literal: true

module HmsEvents
  class BaseEvent
    attr_reader :params

    def initialize(params)
      @params = params
    end

    private

    def data
      params["data"]
    end
  end
end
