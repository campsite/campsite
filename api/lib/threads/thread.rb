# frozen_string_literal: true

module Threads
  class Thread
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def blocks
      data["blocks"]&.map { |block_data| Block.new(block_data.to_json) } || []
    end

    def comments
      data["comments"]&.select(&:present?)&.map { |comment_data| Comment.new(comment_data.to_json) } || []
    end

    def created_at
      data["createdAt"]
    end

    def author_id
      data["authorID"]
    end
  end
end
