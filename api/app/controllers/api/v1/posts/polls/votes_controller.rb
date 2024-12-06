# frozen_string_literal: true

module Api
  module V1
    module Posts
      module Polls
        class VotesController < PostsBaseController
          extend Apigen::Controller

          after_action :verify_authorized

          response model: PostSerializer, code: 201
          def create
            authorize(current_post, :create_poll_vote?)

            option = current_poll.options.find_by(public_id: params[:option_id])
            option.votes.create!(member: current_organization_membership)

            render_json(PostSerializer, current_post.reload, status: :created)
          end

          private

          def current_poll
            @current_poll ||= current_post.poll
          end
        end
      end
    end
  end
end
