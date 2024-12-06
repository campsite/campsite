# frozen_string_literal: true

module Admin
  module Features
    class UserSearchesController < BaseController
      def show
        emails = User
          .where("email LIKE LOWER(?)", "#{params[:q].downcase}%")
          .reject { |user| user.flipper_id.in?(Flipper.feature(params[:feature_name]).actors_value) }
          .map(&:email)

        render(partial: "admin/features/features/actor_search_results", locals: { results: emails })
      end
    end
  end
end
