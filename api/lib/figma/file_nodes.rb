# frozen_string_literal: true

module Figma
  class FileNodes
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def name
      params["name"]
    end

    def nodes
      params["nodes"].map { |_node_id, node_params| FileNode.new(node_params) }
    end
  end
end
