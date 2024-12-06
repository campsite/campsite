# frozen_string_literal: true

module Api
  module V1
    class ResourceMentionsController < BaseController
      rescue_from URI::InvalidURIError, with: :render_unprocessable_entity

      extend Apigen::Controller

      response model: ResourceMentionSerializer, code: 200
      request_params do
        {
          url: { type: :string },
        }
      end
      def show
        result = ResourceMentionCollection.resource_mention_from_url(params[:url])

        if result.blank?
          return render(json: { error: "Invalid resource URL" }, status: :unprocessable_entity)
        end

        resource = case result[:type]
        when "posts"
          post = Post.find_by!(public_id: result[:id])
          authorize(post, :show?)
          { post: post }
        when "calls"
          call = Call.find_by!(public_id: result[:id])
          authorize(call, :show?)
          { call: call }
        when "notes"
          note = Note.find_by!(public_id: result[:id])
          authorize(note, :show?)
          { note: note }
        else
          return render(json: { error: "Invalid resource URL" }, status: :unprocessable_entity)
        end

        render_json(ResourceMentionSerializer, resource.merge(url: params[:url]))
      end
    end
  end
end
