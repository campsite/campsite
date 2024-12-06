# frozen_string_literal: true

class GithubAssigneeSerializer < ApiSerializer
  api_field :login
  api_field :avatarUrl, name: :avatar_url
end
