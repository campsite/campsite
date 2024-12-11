# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      class FigmaUnauthorizedAccess < StandardError; end
      class SyncUnauthorizedAccess < StandardError; end
      class CalDotComUnauthorizedAccess < StandardError; end
      include Pundit::Authorization
      include ActionController::MimeResponds
      include CurrentAttributable
      include RequestRescuable
      include RequestReturnable
      include DatabaseRoleSwitchable

      before_action :require_authenticated_user
      before_action :require_authenticated_organization_membership
      before_action :require_org_two_factor_authentication
      before_action :require_org_sso_authentication
      before_action :set_sentry_info
      before_action :set_user_last_seen_at, if: proc { user_signed_in? && (!current_user.last_seen_at || current_user.last_seen_at < 1.hour.ago) }
      before_action :set_organization_membership_last_seen_at, if: proc { current_organization_membership && (!current_organization_membership.last_seen_at || current_organization_membership.last_seen_at < 1.hour.ago) }
      before_action :ensure_figma_token_access_restricted
      before_action :log_figma_token_access
      before_action :ensure_sync_token_access_restricted
      before_action :ensure_cal_dot_com_token_access_restricted
      before_action :authorize_rack_mini_profiler
      before_action :set_user_preferred_timezone, if: proc { user_signed_in? && current_user.preferred_timezone.blank? }

      def render_unauthorized_error(_error = nil)
        render_error(status: :unauthorized, code: "unauthorized", message: "Sign in or sign up before continuing")
      end

      def render_ok
        render(json: {}, status: :ok)
      end

      def render_created
        render(json: {}, status: :created)
      end

      def render_not_found
        render_error(status: :not_found, code: :not_found, message: "Not found")
      end

      def render_error(status:, message:, code: nil)
        error_json = {
          code: code,
          message: message,
        }
        render(status: status, json: error_json)
      end

      def render_json(serializer, resource, opts = {})
        opts[:user] = current_user
        opts[:member] = safe_current_organization_membership
        super(serializer, resource, opts)
      end

      def require_authenticated_user
        return if user_signed_in?

        respond_to do |format|
          format.html do
            store_location_for(:user, request.fullpath)
            redirect_to(new_user_session_path)
          end

          format.any { render_unauthorized_error }
        end
      end

      def require_authenticated_organization_membership
        return if current_organization_membership

        render_error(status: :forbidden, code: "forbidden", message: "You are not a member of this organization.")
      end

      def require_organization
        return if current_organization

        render_not_found
      end

      def set_sentry_info
        return unless user_signed_in?

        Sentry.set_user(id: current_user&.public_id, username: current_user&.username)
      end

      def set_user_last_seen_at
        # Disabled since Userlist isn't setup in the public version
        # UpdateUserLastSeenAtJob.perform_async(current_user.id)
      end

      def set_organization_membership_last_seen_at
        UpdateOrganizationMembershipLastSeenAtJob.perform_async(current_organization_membership.id)
      end

      def current_organization
        return unless params[:org_slug]

        @current_organization ||= current_organization_membership&.organization || Organization.find_by(slug: params[:org_slug])
      end

      def current_organization_membership
        @current_organization_membership ||= current_user
          &.kept_organization_memberships
          &.joins(:organization)
          &.eager_load(:latest_status, organization: [:enforce_two_factor_authentication_setting, :enforce_sso_authentication_setting])
          &.find_by(organization: { slug: params[:org_slug] })
      end

      def safe_current_organization_membership
        if params[:org_slug]
          begin
            current_organization_membership
          rescue
            # rescue any error that might happen here,
            # since we don't want to break the whole request
          end
        end
      end

      def analytics
        @analytics ||= Analytics.new(user: current_user, org_slug: params[:org_slug], request: request)
      end

      def current_project
        @current_project ||= current_organization.projects.find_by!(public_id: params[:project_id])
      end

      def current_user_sso_session?
        return false unless current_user.workos_profile_id?

        session[:sso_session_id] == current_user.workos_profile_id
      end

      def require_org_two_factor_authentication
        return unless current_organization
        return unless current_organization_membership
        return unless current_organization.enforce_two_factor_authentication?

        unless current_user.otp_enabled?
          render_error(
            status: :forbidden,
            code: "two_factor_authentication_required",
            message: "Your organization has enforced two-factor authentication, please enable two-factor authentication to continue.",
          )
        end
      end

      def ensure_figma_token_access_restricted
        return unless figma_token_auth?

        unless FigmaPluginAccess.allowed?(controller: params[:controller], action: params[:action])
          render_forbidden(FigmaUnauthorizedAccess.new("Unauthorized Figma API request"))
        end
      end

      def log_figma_token_access
        return unless figma_token_auth?

        Rails.logger.info("Request by Figma AccessToken ID: #{doorkeeper_token.id}, action: #{params[:controller]}##{params[:action]}")
      end

      def ensure_sync_token_access_restricted
        return unless sync_token_auth?

        unless SyncTokenAccess.allowed?(controller: params[:controller], action: params[:action])
          render_forbidden(SyncUnauthorizedAccess.new("Unauthorized Sync API request"))
        end
      end

      def ensure_cal_dot_com_token_access_restricted
        return unless cal_dot_com_token_auth?

        unless CalDotComTokenAccess.allowed?(controller: params[:controller], action: params[:action])
          render_forbidden(CalDotComUnauthorizedAccess.new("Unauthorized Cal.com API request"))
        end
      end

      def require_org_sso_authentication
        return unless current_organization
        return unless current_organization_membership&.enforce_sso_authentication?
        return if figma_token_auth?
        return if sync_token_auth?

        unless current_user_sso_session?
          render_error(
            status: :forbidden,
            code: "sso_required",
            message: "Your organization requires SSO authentication, please authenticate through SSO to continue.",
          )
        end
      end

      def require_linear_integration
        render(status: :forbidden) unless current_organization.linear_integration
      end

      def figma_token_auth?
        return @figma_token_auth if defined?(@figma_token_auth)

        @figma_token_auth = doorkeeper_token&.application&.figma?
      end

      def sync_token_auth?
        @sync_token_auth ||= doorkeeper_token&.application&.editor_sync?
      end

      def cal_dot_com_token_auth?
        return @cal_dot_com_token_auth if defined?(@cal_dot_com_token_auth)

        @cal_dot_com_token_auth = doorkeeper_token&.application&.cal_dot_com?
      end

      def to_bool(bool)
        ActiveModel::Type::Boolean.new.cast(bool) || false
      end

      def retry_deadlock
        attempts_left = 3
        while attempts_left > 0
          attempts_left -= 1
          begin
            return yield
          rescue ActiveRecord::Deadlocked
            raise if attempts_left <= 0
          end
        end
      end

      def pundit_user
        @pundit_user ||= ApiActor.new(user: current_user)
      end

      unless Rails.env.production?
        around_action :n_plus_one_detection

        def n_plus_one_detection
          Prosopite.scan
          yield
        ensure
          Prosopite.finish
        end
      end

      private

      def authorize_rack_mini_profiler
        return unless current_user&.staff?

        Rack::MiniProfiler.authorize_request
      end

      def order_params(default:)
        return default unless params[:order]

        { params[:order][:by].to_sym => params[:order][:direction].to_sym, id: :desc }
      end

      def client_ip
        request.env["HTTP_FLY_CLIENT_IP"] || request.remote_ip
      end

      def set_user_preferred_timezone
        return unless (timezone = request.headers["X-Campsite-Tz"])

        SetUserPreferredTimezoneJob.perform_async(current_user.id, timezone)
      end
    end
  end
end
