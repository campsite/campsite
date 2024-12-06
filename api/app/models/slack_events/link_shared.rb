# frozen_string_literal: true

module SlackEvents
  class LinkShared < EventCallback
    TYPE = "link_shared"

    def handle
      HandleLinkSharedJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel
      event_params["channel"]
    end

    def message_ts
      event_params["message_ts"]
    end

    def links
      event_params["links"].map { |link| SlackLink.new(link) }
    end
  end
end
