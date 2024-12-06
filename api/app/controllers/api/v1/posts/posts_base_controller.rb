# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostsBaseController < BaseController
        def current_post
          raise ActiveRecord::RecordNotFound unless current_organization

          @current_post ||= current_organization.kept_published_posts.feed_includes.find_by!(public_id: params[:post_id])
        end
      end
    end
  end
end
