# frozen_string_literal: true

module LinearEvents
  class UpdateIssue < EventCallback
    TYPE = "Issue"

    def handle
      HandleIssueUpdateJob.perform_async(params.to_json)
      { ok: true }
    end

    def issue_id
      data_params["id"]
    end

    def issue_title
      data_params["title"]
    end

    def issue_url
      data_params["url"]
    end

    def issue_description
      data_params["description"]
    end

    def issue_state
      data_params["state"]
    end

    def issue_identifier
      data_params["identifier"]
    end
  end
end
