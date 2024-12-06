# frozen_string_literal: true

module SlackEvents
  class GroupUnarchive < EventCallback
    TYPE = "group_unarchive"

    def handle
      HandleGroupUnarchiveJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
