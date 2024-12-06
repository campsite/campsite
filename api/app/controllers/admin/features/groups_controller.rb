# frozen_string_literal: true

module Admin
  module Features
    class GroupsController < BaseController
      def create
        Flipper.enable_group(feature_name, group_name)
        flash[:notice] = "Enabled #{feature_name} for #{group_name}"
        redirect_to(feature_path(feature_name))
      end

      def destroy
        Flipper.disable_group(feature_name, group_name)
        flash[:notice] = "Disabled #{feature_name} for #{group_name}"
        redirect_to(feature_path(feature_name))
      end

      private

      def feature_name
        params[:feature_name]
      end

      def group_name
        params[:name]
      end
    end
  end
end
