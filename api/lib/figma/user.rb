# frozen_string_literal: true

module Figma
  class User
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def id
      params["id"]
    end

    def email
      params["email"]
    end

    def handle
      params["handle"]
    end

    def img_url
      params["img_url"]
    end
  end
end
