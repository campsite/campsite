# frozen_string_literal: true

module Api
  module V2
    class BaseController < ActionController::API
      class UnauthorizedError < StandardError; end

      MAX_CURSOR_PAGINATION_LIMIT = 50
      ALLOWED_ORDER_DIRECTIONS = [:asc, :desc]

      include Pundit::Authorization
      include RequestRescuable
      include RequestReturnable

      before_action :require_org_header_for_user_scoped_token
      before_action :reject_org_slug_for_org_scoped_token
      before_action :authenticate
      before_action :set_sentry_info
      before_action :limit_cursor_pagination, only: :index
      before_action :validate_order_params, only: :index

      after_action :verify_authorized, except: :not_found
      after_action :verify_policy_scoped, only: :index

      rescue_from UnauthorizedError, with: :render_unauthorized

      def not_found
        render_endpoint_not_found
      end

      private

      def authenticate
        raise UnauthorizedError, "Invalid API key." unless valid_doorkeeper_token?
        raise UnauthorizedError, "The user is not a member of this organization." if token_owned_by_user? && current_organization.nil?
      end

      def pundit_user
        @pundit_user ||= ApiActor.new(access_token: doorkeeper_token, org_slug: org_slug)
      end

      def org_slug
        request.headers["x-campsite-org"]
      end

      def current_oauth_application
        @oauth_application ||= doorkeeper_token&.application
      end

      def current_organization
        return @current_organization if defined?(@current_organization)

        @current_organization =
          if token_owned_by_organization?
            Organization.find_by(id: doorkeeper_token.resource_owner_id)
          elsif token_owned_by_user? && org_slug.present?
            organization = Organization.find_by(slug: org_slug)
            organization if organization && current_user.kept_organization_memberships.exists?(organization: organization)
          end
      end

      def current_organization_membership
        return unless token_owned_by_user?

        @current_organization_membership ||= current_user
          &.kept_organization_memberships
          &.joins(:organization)
          &.find_by(organization: { slug: org_slug })
      end

      def current_resource_owner
        return @current_resource_owner if defined?(@current_resource_owner)

        @current_resource_owner =
          if token_owned_by_user?
            User.find(doorkeeper_token&.resource_owner_id)
          elsif token_owned_by_organization?
            current_organization
          end
      end

      def current_api_actor
        return @current_api_actor if defined?(@current_api_actor)

        @current_api_actor =
          if token_owned_by_user?
            current_organization_membership
          elsif token_owned_by_organization?
            current_oauth_application
          end
      end

      def require_org_header_for_user_scoped_token
        return unless token_owned_by_user?

        return if org_slug.present?

        render_error(
          status: :unprocessable_entity,
          code: "missing_org_header",
          message: "The X-Campsite-Org header is required for user-scoped tokens.",
        )
      end

      def reject_org_slug_for_org_scoped_token
        return unless token_owned_by_organization?

        return if org_slug.blank?

        render_error(
          status: :unprocessable_entity,
          code: "org_header_not_allowed",
          message: "The X-Campsite-Org header is not allowed for org-scoped tokens.",
        )
      end

      def token_owned_by_organization?
        doorkeeper_token&.resource_owner_type == "Organization"
      end

      def token_owned_by_user?
        doorkeeper_token&.resource_owner_type == "User"
      end

      def set_sentry_info
        return unless valid_doorkeeper_token?

        Sentry.set_user(
          id: doorkeeper_token.application&.public_id,
          username: doorkeeper_token.application&.name,
          organization: current_organization&.slug,
        )
      end

      def render_error(status:, message:, code: nil)
        error_json = {
          code: code,
          message: message,
        }
        render(status: status, json: { error: error_json })
      end

      def validate_order_params
        if direction_param && ALLOWED_ORDER_DIRECTIONS.exclude?(direction_param)
          render_error(
            status: :unprocessable_entity,
            message: "Invalid direction field. Allowed values are: #{ALLOWED_ORDER_DIRECTIONS.join(", ")}.",
          )
        end

        if sort_param && allowed_order_fields.exclude?(sort_param)
          render_error(
            status: :unprocessable_entity,
            message: "Invalid sort field. Allowed values are: #{allowed_order_fields.join(", ")}.",
          )
        end
      end

      def allowed_order_fields
        []
      end

      def sort_param(default = nil)
        params[:sort]&.to_sym || params.dig(:order, :by)&.to_sym || default
      end

      def direction_param(default = nil)
        params[:direction]&.to_sym || params.dig(:order, :direction)&.to_sym || default
      end

      def order_params(default:)
        sort = sort_param(default.keys.first)
        direction = direction_param(default.values.first)

        { sort => direction, id: :desc }
      end

      def limit_cursor_pagination
        return unless params[:limit]

        if params[:limit].to_i > MAX_CURSOR_PAGINATION_LIMIT
          render_error(status: :unprocessable_entity, message: "`limit` must be less than or equal to #{MAX_CURSOR_PAGINATION_LIMIT}.")
        end
      end
    end
  end
end
