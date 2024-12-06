# frozen_string_literal: true

module Admin
  module Features
    class OrganizationsController < BaseController
      def create
        if org
          Flipper.enable(feature_name, org)
          flash[:notice] = "Enabled #{feature_name} for #{org.slug}"
        else
          flash[:alert] = "No organization found with that slug"
        end

        redirect_to(feature_path(feature_name))
      end

      def destroy
        if org
          Flipper.disable(feature_name, org)
          flash[:notice] = "Disabled #{feature_name} for #{org.slug}"
        else
          flash[:alert] = "Organization not found"
        end

        redirect_to(feature_path(feature_name))
      end

      private

      def feature_name
        params[:feature_name]
      end

      def org
        Organization.find_by(slug: params[:slug])
      end
    end
  end
end
