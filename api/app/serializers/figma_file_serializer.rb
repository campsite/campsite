# frozen_string_literal: true

class FigmaFileSerializer < ApiSerializer
  api_field :id, type: :integer
  api_field :remote_file_key, name: :file_key
  api_field :name
end
