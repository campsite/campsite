# frozen_string_literal: true

module SlackEvents
  class AppUninstalled < EventCallback
    TYPE = "app_uninstalled"

    def handle
      HandleAppUninstalledJob.perform_async(params.to_json)
      { ok: true }
    end
  end
end
