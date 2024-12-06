# frozen_string_literal: true

class GithubLabelSerializer < ApiSerializer
  api_field :name
  api_field :color do |option|
    "##{option[:color]}"
  end
end
