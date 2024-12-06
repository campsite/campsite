# frozen_string_literal: true

module Api
  module V1
    module Users
      class PreferencesController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: :update

        extend Apigen::Controller

        response code: 200 do
          { preference: { type: :string } }
        end
        request_params do
          {
            preference: { type: :string },
            value: { type: :string },
          }
        end
        def update
          preference = current_user.find_or_initialize_preference(params[:preference])
          preference.value = params[:value]

          if preference.save
            analytics.track(
              event: "user_preference_changed",
              properties: { preference: params[:preference], value: params[:value] },
            )

            render(json: { preference: preference.value }, status: :ok)
          else
            render_error(status: :unprocessable_entity, code: "unprocessable", message: preference.errors.full_messages.to_sentence)
          end
        end
      end
    end
  end
end
