# frozen_string_literal: true

module SlackEvents
  class GroupRename < EventCallback
    TYPE = "group_rename"

    def handle
      HandleGroupRenameJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      channel_params["id"]
    end

    def channel_name
      channel_params["name"]
    end

    private

    def channel_params
      event_params["channel"]
    end
  end
end
