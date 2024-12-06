# frozen_string_literal: true

module Admin
  module Features
    class EnablementsController < BaseController
      def create
        feature.enable
        redirect_to(feature_path(feature_name))
      end

      def destroy
        feature.disable
        flash[:notice] = "Fully disabled #{feature_name}"
        redirect_to(feature_path(feature_name))
      end

      private

      def feature_name
        params[:feature_name]
      end

      def feature
        Flipper.feature(feature_name)
      end
    end
  end
end
