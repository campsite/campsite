# frozen_string_literal: true

module Admin
  module Features
    class FeaturesController < BaseController
      before_action :set_breadcrumbs

      def index
        render("admin/features/features/index")
      end

      def create
        feature.add
        flash[:notice] = "Created #{feature.name} feature"
        redirect_to(feature_path(feature.name))
      end

      def destroy
        feature.remove
        flash[:notice] = "Deleted #{feature.name} feature"
        redirect_to(features_path)
      end

      def show
        add_breadcrumb("Feature")

        enabled_actors = feature.actors_value.map do |item|
          model_name, id = item.split(";")
          model = model_name.constantize
          model.find_by(id: id) || NullActor.build(model: model, id: id)
        end
        enabled_users = enabled_actors.select { |actor| actor.is_a?(User) }.sort_by { |user| user.email.downcase }
        enabled_orgs = enabled_actors.select { |actor| actor.is_a?(Organization) }.sort_by { |org| org.name.downcase }
        enabled_groups, enablable_groups = Flipper.groups.partition { |group| group.in?(feature.enabled_groups) }

        render("admin/features/features/show", locals: {
          feature: feature,
          enabled_users: enabled_users,
          enabled_orgs: enabled_orgs,
          enabled_groups: enabled_groups,
          enablable_groups: enablable_groups,
          logs: FlipperAuditLog.includes(:user).where(feature_name: feature.name).order(created_at: :desc),
        })
      end

      private

      def feature
        Flipper.feature(params[:name])
      end

      def set_breadcrumbs
        add_breadcrumb("Features", features_path)
      end
    end
  end
end
