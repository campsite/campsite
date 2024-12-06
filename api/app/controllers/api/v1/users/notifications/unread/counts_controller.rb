# frozen_string_literal: true

module Api
  module V1
    module Users
      module Notifications
        module Unread
          class CountsController < BaseController
            skip_before_action :require_authenticated_organization_membership, only: :show

            extend Apigen::Controller

            response model: UserNotificationCountsSerializer, code: 200
            def show
              render_json(UserNotificationCountsSerializer, current_user)
            end
          end
        end
      end
    end
  end
end
