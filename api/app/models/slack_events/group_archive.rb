# frozen_string_literal: true

module SlackEvents
  class GroupArchive < EventCallback
    TYPE = "group_archive"

    def handle
      HandleGroupArchiveJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
