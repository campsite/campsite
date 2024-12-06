# frozen_string_literal: true

module Threads
  class User
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def id
      data["id"]
    end

    def primary_email_or_fallback
      primary_email || "#{[first_name, last_name, id].select(&:present?).map(&:downcase).join("-")}@campsite.com"
    end

    def full_name
      [first_name, last_name].select(&:present?).join(" ")
    end

    private

    def primary_email
      data["primaryEmail"]
    end

    def first_name
      data["firstName"]
    end

    def last_name
      data["lastName"]
    end
  end
end
