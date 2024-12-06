# frozen_string_literal: true

class LinearTeamMemberSerializer < ApiSerializer
  api_field :id
  api_field :name
  api_field :email
  api_field :avatarUrl, name: :avatar_url, nullable: true
end
