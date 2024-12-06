# frozen_string_literal: true

module Api
  module V1
    module Notifications
      class DeleteAllController < BaseController
        extend Apigen::Controller

        request_params do
          {
            home_only: { type: :boolean, required: false },
            read_only: { type: :boolean, required: false },
          }
        end
        response code: 201
        def create
          scope = current_organization_membership
            .kept_notifications

          if to_bool(params[:read_only])
            scope = scope.read
          end

          if to_bool(params[:home_only])
            scope = scope.home_inbox
          end

          scope.update_all(archived_at: Time.current)
          render(json: {}, status: :created)
        end
      end
    end
  end
end
