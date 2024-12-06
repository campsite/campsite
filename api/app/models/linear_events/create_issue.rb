# frozen_string_literal: true

module LinearEvents
  class CreateIssue < EventCallback
    include Referenceable

    TYPE = "Issue"

    def handle
      if contains_campsite_urls?(issue_description)
        HandleCreateIssueReferenceJob.perform_async(params.to_json)
      end

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

    def private_team?
      data_params["team"]["private"] == true
    end

    def text_content
      issue_description
    end
  end
end
