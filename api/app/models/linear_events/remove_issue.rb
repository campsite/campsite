# frozen_string_literal: true

module LinearEvents
  class RemoveIssue < EventCallback
    TYPE = "Issue"

    def handle
      HandleIssueRemoveJob.perform_async(params.to_json)
      { ok: true }
    end

    def issue_id
      data_params["id"]
    end
  end
end
