# frozen_string_literal: true

module Users
  class ConfirmationsController < Devise::ConfirmationsController
    include DatabaseRoleSwitchable

    around_action :force_database_writing_role, only: [:show]

    # GET /resource/confirmation?confirmation_token=abcdef
    def show
      self.resource = resource_class.confirm_by_token(params[:confirmation_token])

      if resource.errors.empty?
        set_flash_message!(:notice, :confirmed)
        respond_with_navigational(resource) { redirect_to(after_confirmation_path_for(resource)) }
      else
        respond_with_navigational(resource.errors, status: :unprocessable_entity) { redirect_to(after_confirmation_path_for(resource)) }
      end
    end

    private

    def after_confirmation_path_for(resource)
      stored_location_for(resource) || Campsite.base_app_url.to_s
    end
  end
end
