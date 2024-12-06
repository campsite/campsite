# frozen_string_literal: true

module Admin
  module Features
    class OrganizationSearchesController < BaseController
      def show
        slugs = Organization
          .where("slug LIKE LOWER(?)", "#{params[:q].downcase}%")
          .reject { |org| org.flipper_id.in?(Flipper.feature(params[:feature_name]).actors_value) }
          .map(&:slug)

        render(partial: "admin/features/features/actor_search_results", locals: { results: slugs })
      end
    end
  end
end
