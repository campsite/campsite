# frozen_string_literal: true

module SlackEvents
  class GroupDeleted < EventCallback
    TYPE = "group_deleted"

    def handle
      HandleGroupDeletedJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
