# frozen_string_literal: true

module Admin
  module Features
    class UsersController < BaseController
      def create
        user = User.find_by(email: params[:email])

        if user
          Flipper.enable(feature_name, user)
          flash[:notice] = "Enabled #{feature_name} for #{user.email}"
        else
          flash[:alert] = "No user found with that email"
        end

        redirect_to(feature_path(feature_name))
      end

      def destroy
        user = User.find_by(id: params[:id])

        if user
          Flipper.disable(feature_name, user)
          flash[:notice] = "Disabled #{feature_name} for #{user.email}"
        else
          flash[:alert] = "User not found"
        end

        redirect_to(feature_path(feature_name))
      end

      private

      def feature_name
        params[:feature_name]
      end
    end
  end
end
