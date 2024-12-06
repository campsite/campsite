# frozen_string_literal: true

class GithubEvent
  class UnrecognizedTypeError < StandardError
    def message
      "unrecognized GitHub event type"
    end
  end

  def self.from_params(raw_body, params)
    action = JSON.parse(raw_body)["action"]

    if action == "deleted" && params.key?("issue")
      return GithubEvents::DeleteIssue.new(params)
    elsif action == "edited" && params.key?("issue")
      return GithubEvents::UpdateIssue.new(params)
    elsif action == "closed" && params.key?("issue")
      return GithubEvents::CloseIssue.new(params)
    elsif action == "reopened" && params.key?("issue")
      return GithubEvents::ReopenIssue.new(params)
    elsif action == "deleted" && params.key?("installation")
      return GithubEvents::DeleteInstallation.new(params)
    elsif action == "suspend" && params.key?("installation")
      return GithubEvents::SuspendInstallation.new(params)
    elsif action == "unsuspend" && params.key?("installation")
      return GithubEvents::UnsuspendInstallation.new(params)
    end

    raise UnrecognizedTypeError
  end
end
