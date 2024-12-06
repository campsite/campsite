# frozen_string_literal: true

module Api
  module V1
    module Projects
      class BookmarksController < V1::BaseController
        extend Apigen::Controller

        response code: 200, model: BookmarkSerializer, is_array: true
        def index
          authorize(current_project, :show?)

          render_json(BookmarkSerializer, current_project.bookmarks)
        end

        response code: 201, model: BookmarkSerializer
        request_params do
          {
            title: { type: :string },
            url: { type: :string },
          }
        end
        def create
          authorize(current_project, :update?)

          bookmark = current_project.bookmarks.create!(title: params[:title], url: params[:url])
          render_json(BookmarkSerializer, bookmark, status: :created)
        end

        response code: 200, model: BookmarkSerializer
        request_params do
          {
            title: { type: :string },
            url: { type: :string },
          }
        end
        def update
          authorize(current_project, :update?)

          bookmark = current_project.bookmarks.find_by!(public_id: params[:id])
          bookmark.update!(title: params[:title], url: params[:url])

          render_json(BookmarkSerializer, bookmark)
        end

        response code: 200, model: BookmarkSerializer, is_array: true
        request_params do
          {
            bookmarks: {
              type: :object,
              is_array: true,
              properties: {
                id: { type: :string },
                position: { type: :number },
              },
            },
          }
        end
        def reorder
          authorize(current_project, :update?)

          positions = params[:bookmarks]&.each_with_object({}) do |bookmark, obj|
            obj[bookmark[:id]] = bookmark[:position]
          end

          if positions&.any?
            current_project.bookmarks.where(public_id: positions.keys).find_each do |bookmark|
              bookmark.update!(position: positions[bookmark.public_id])
            end
          end

          render_json(BookmarkSerializer, current_project.bookmarks.reload)
        end

        response code: 204
        def destroy
          authorize(current_project, :update?)

          bookmark = current_project.bookmarks.find_by!(public_id: params[:id])
          bookmark.destroy!
        end

        private

        def current_project
          @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
        end
      end
    end
  end
end
