# frozen_string_literal: true

module Api
  module V1
    class DataExportCallbacksController < BaseController
      skip_before_action :require_authenticated_user, only: :update
      skip_before_action :require_org_sso_authentication, only: :update
      skip_before_action :require_org_two_factor_authentication, only: :update
      skip_before_action :require_authenticated_organization_membership, only: :update

      def update
        current_data_export.complete(params[:zip_path])
        render_ok
      end

      private

      def current_data_export
        @current_data_export ||= DataExport.find_by!(public_id: params[:id])
      end
    end
  end
end
