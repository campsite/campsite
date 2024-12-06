# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class DmsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: MessageThreadDmResultSerializer, code: 200
        def show
          authorize(current_organization, :list_threads?)

          dm = current_organization_membership
            .message_threads
            .serializer_includes
            .joins(:users)
            .find_by(group: false, users: { username: params[:username] })

          authorize(dm, :show?) if dm
          render_json(MessageThreadDmResultSerializer, { dm: dm })
        end
      end
    end
  end
end
