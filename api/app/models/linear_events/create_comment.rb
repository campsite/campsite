# frozen_string_literal: true

module LinearEvents
  class CreateComment < EventCallback
    include Referenceable

    TYPE = "Comment"

    def handle
      if contains_campsite_urls?(comment_body)
        HandleCreateCommentReferenceJob.perform_async(params.to_json)
      end

      { ok: true }
    end

    def comment_id
      data_params["id"]
    end

    def comment_url
      params["url"]
    end

    def comment_body
      data_params["body"]
    end

    def issue_id
      data_params["issue"]["id"]
    end

    def issue_title
      data_params["issue"]["title"]
    end

    def text_content
      comment_body
    end
  end
end
