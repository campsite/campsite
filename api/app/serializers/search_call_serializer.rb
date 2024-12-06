# frozen_string_literal: true

class SearchCallSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title, nullable: true do |call, options|
    call.formatted_title(options[:member])
  end
  api_field :created_at
end
