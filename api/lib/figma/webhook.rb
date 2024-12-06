# frozen_string_literal: true

module Figma
  class Webhook
    def initialize(params)
      @params = params
    end

    attr_reader :params

    def id
      params["id"]
    end

    def team_id
      params["team_id"]
    end

    def endpoint
      params["endpoint"]
    end

    def passcode
      params["passcode"]
    end

    def active?
      status == "ACTIVE"
    end

    def file_comment_event_type?
      event_type == FigmaEvents::FileComment::TYPE
    end

    private

    def status
      params["status"]
    end

    def event_type
      params["event_type"]
    end
  end
end
