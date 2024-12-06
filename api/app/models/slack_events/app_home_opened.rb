# frozen_string_literal: true

module SlackEvents
  class AppHomeOpened < EventCallback
    TYPE = "app_home_opened"

    def handle
      HandleAppHomeOpenedJob.perform_async(params.to_json)
      { ok: true }
    end

    def user
      event_params["user"]
    end

    def channel
      event_params["channel"]
    end
  end
end
