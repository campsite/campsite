# frozen_string_literal: true

module SlackEvents
  class EventCallback
    TYPE = "event_callback"

    attr_reader :params

    def initialize(params)
      @params = params
    end

    def team_id
      params["team_id"]
    end

    private

    def event_params
      params["event"]
    end
  end
end
