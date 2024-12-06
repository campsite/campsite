# frozen_string_literal: true

module Api
  module V1
    module Posts
      class Polls2Controller < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: PostSerializer, code: 201
        request_params do
          {
            description: { type: :string },
            options: { type: :object, is_array: true, properties: { description: { type: :string } } },
          }
        end
        def create
          authorize(current_post, :create_poll?)

          poll_creator = Poll::CreatePoll.new(
            post: current_post,
            description: params[:description],
            options_attributes: params.permit(options: :description).dig(:options),
          )

          if poll_creator.save
            render_json(PostSerializer, current_post, status: :created)
          else
            render_unprocessable_entity(poll_creator)
          end
        end

        response model: PostSerializer, code: 200
        request_params do
          {
            description: { type: :string },
            options: { type: :object, is_array: true, properties: { id: { type: :string, required: false }, description: { type: :string } } },
          }
        end
        def update
          authorize(current_post, :update_poll?)

          if params.key?(:description)
            current_poll.description = params[:description]
          end

          current_poll.options_attributes = params.permit(options: [:description, :id]).dig(:options)

          if current_poll.save
            render_json(PostSerializer, current_post, status: :ok)
          else
            render_unprocessable_entity(current_poll)
          end
        end

        response code: 204
        def destroy
          authorize(current_post, :update_poll?)

          current_poll.destroy!
        end

        private

        def current_poll
          @current_poll ||= current_post.poll
        end
      end
    end
  end
end
