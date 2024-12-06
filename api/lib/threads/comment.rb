# frozen_string_literal: true

module Threads
  class Comment
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def blocks
      data["blocks"].map { |block_data| Block.new(block_data.to_json) }
    end

    def created_at
      data["createdAt"]
    end

    def author_id
      data["authorID"]
    end
  end
end
