# frozen_string_literal: true

module Hms
  class Room
    def initialize(attributes)
      @attributes = attributes
    end

    attr_reader :attributes

    def id
      attributes["id"]
    end
  end
end
