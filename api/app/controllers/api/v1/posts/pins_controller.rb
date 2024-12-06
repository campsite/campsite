# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PinsController < PostsBaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: ProjectPinCreatedSerializer, code: 201
        def create
          authorize(current_post, :create_pin?)

          pin = current_post.project.pins.create_or_find_by(subject: current_post, pinner: current_organization_membership)
          pin.undiscard if pin.discarded?

          render_json(ProjectPinCreatedSerializer, { pin: pin }, status: :created)
        end
      end
    end
  end
end
