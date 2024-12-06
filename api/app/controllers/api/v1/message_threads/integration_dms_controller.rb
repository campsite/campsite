# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class IntegrationDmsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: MessageThreadDmResultSerializer, code: 200
        def show
          authorize(current_organization, :list_threads?)

          oauth_application = current_organization.kept_oauth_applications.find_by(public_id: params[:oauth_application_id])

          dm = current_organization_membership
            .message_threads
            .serializer_includes
            .eager_load(:oauth_applications)
            .find_by(group: false, oauth_applications: oauth_application)

          authorize(dm, :show?) if dm
          render_json(MessageThreadDmResultSerializer, { dm: dm })
        end
      end
    end
  end
end
