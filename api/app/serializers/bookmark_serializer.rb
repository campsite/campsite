# frozen_string_literal: true

class BookmarkSerializer < ApiSerializer
  def self.schema_name
    "ProjectBookmark"
  end

  api_field :public_id, name: :id
  api_field :title
  api_field :url
end
