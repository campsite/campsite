# frozen_string_literal: true

module Api
  module V1
    module Posts
      class SharesController < PostsBaseController
        extend Apigen::Controller

        response code: 204
        request_params do
          {
            member_ids: { is_array: true, type: :string, required: false },
            slack_channel_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_post, :share?)

          share = PostShare.new(
            post: current_post,
            user: current_user,
            member_ids: params[:member_ids],
            slack_channel_id: params[:slack_channel_id],
          )

          unless share.save
            render_unprocessable_entity(share)
          end
        end
      end
    end
  end
end
