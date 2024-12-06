# frozen_string_literal: true

module Api
  module V1
    module Posts
      class VotersController < PostsBaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_user, only: :index
        skip_before_action :require_authenticated_organization_membership, only: :index

        after_action :verify_authorized

        request_params do
          {
            after: { type: :string, required: false },
            limit: { type: :number, required: false },
          }
        end
        response model: OrganizationMemberPageSerializer, code: 200
        def index
          authorize(current_post, :show?)

          option = current_poll.options.find_by(public_id: params[:poll_option_id])

          if option
            render_page(OrganizationMemberPageSerializer, option.voters.serializer_eager_load)
          else
            render_unprocessable_entity(current_poll)
          end
        end

        private

        def current_poll
          @current_poll ||= current_post.poll
        end
      end
    end
  end
end
