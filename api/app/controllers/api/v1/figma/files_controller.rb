# frozen_string_literal: true

module Api
  module V1
    module Figma
      class FilesController < BaseController
        extend Apigen::Controller

        response model: FigmaFileSerializer, code: 201
        request_params do
          {
            remote_file_key: { type: :string, required: true },
            name: { type: :string, required: true },
          }
        end
        def create
          file = FigmaFile.find_or_initialize_by(remote_file_key: params[:remote_file_key])
          file.name = params[:name]
          file.save!
          render_json(FigmaFileSerializer, file, status: :created)
        end
      end
    end
  end
end
