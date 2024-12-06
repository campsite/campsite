# frozen_string_literal: true

class NoteSyncSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :description_schema_version, type: :integer
  api_field :description_state, nullable: true
  api_field :description_html, default: ""
end
