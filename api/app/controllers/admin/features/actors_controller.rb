# frozen_string_literal: true

module Admin
  module Features
    class ActorsController < BaseController
      def destroy
        actor = Flipper::Actor.new(params[:id])
        Flipper.disable(feature_name, actor)
        flash[:notice] = "Disabled #{feature_name} for #{actor.flipper_id}"
        redirect_to(feature_path(feature_name))
      end

      private

      def feature_name
        params[:feature_name]
      end
    end
  end
end
