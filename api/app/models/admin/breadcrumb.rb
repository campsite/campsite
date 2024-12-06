# frozen_string_literal: true

module Admin
  class Breadcrumb
    attr_reader :name, :path

    def initialize(name, path)
      @name = name
      @path = path
    end

    def link?
      @path.present?
    end
  end
end
