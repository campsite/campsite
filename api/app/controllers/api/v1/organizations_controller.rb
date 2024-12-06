# frozen_string_literal: true

module Api
  module V1
    class OrganizationsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: [:index, :create, :join]
      skip_before_action :require_org_sso_authentication, only: [:join]
      skip_before_action :require_org_two_factor_authentication, only: [:join]

      extend Apigen::Controller

      response model: OrganizationSerializer, code: 200
      def show
        authorize(current_organization, :show?)

        render_json(OrganizationSerializer, current_organization, { view: :show })
      end

      response model: OrganizationSerializer, code: 201
      request_params do
        {
          name: { type: :string },
          slug: { type: :string },
          avatar_path: { type: :string, required: false, nullable: true },
          role: { type: :string, required: false },
          org_size: { type: :string, required: false },
          source: { type: :string, required: false },
          why: { type: :string, required: false },
        }
      end
      def create
        authorize(current_user, :create_organization?)

        org = Organization.create_organization(
          creator: current_user,
          name: params[:name],
          slug: params[:slug],
          avatar_path: params[:avatar_path],
          role: params[:role],
          org_size: params[:org_size],
          source: params[:source],
          why: params[:why],
        )

        render_json(OrganizationSerializer, org, { status: :created, view: :show })
      end

      response model: OrganizationSerializer, code: 200
      request_params do
        {
          name: { type: :string, required: false },
          slug: { type: :string, required: false },
          avatar_path: { type: :string, required: false, nullable: true },
          billing_email: { type: :string, required: false },
          email_domain: { type: :string, required: false, nullable: true },
          slack_channel_id: { type: :string, required: false, nullable: true },
          slack_channel_is_private: { type: :boolean, required: false, nullable: true },
        }
      end
      def update
        authorize(current_organization, :update?)

        current_organization.avatar_path = params[:avatar_path] if params[:avatar_path]
        current_organization.billing_email = params[:billing_email] if params[:billing_email]
        current_organization.name = params[:name] if params[:name]
        current_organization.slug = params[:slug] if params[:slug]

        # value can be nil which unsets the channel
        if params.key?(:slack_channel_id)
          current_organization.update_slack_channel!(
            id: params[:slack_channel_id],
            is_private: params[:slack_channel_is_private] == true,
          )
        end

        if params.key?(:email_domain)
          if params[:email_domain]
            if current_organization.email_domain_matches?(current_user, params[:email_domain])
              current_organization.email_domain = params[:email_domain].downcase
            else
              return render_error(
                status: :unprocessable_entity,
                code: :unprocessable,
                message: "The domain provided does not match your email address domain. Please update your email to match the domain and try again.",
              )
            end
          else
            current_organization.email_domain = nil
          end
        end

        current_organization.save!

        render_json(OrganizationSerializer, current_organization, { view: :show })
      end

      response model: OrganizationSerializer, code: 200
      def reset_invite_token
        authorize(current_organization, :invite_member?)

        current_organization.reset_invite_token!

        render_json(OrganizationSerializer, current_organization, { view: :show })
      end

      response code: 204
      def destroy
        authorize(current_organization, :destroy?)

        current_organization.destroy!
      end

      response model: SuggestedOrganizationSerializer, code: 200
      def join
        org = Organization.friendly.find_by!(slug: params[:org_slug], invite_token: params[:token])
        authorize(org, :join?)

        org.join(
          user: current_user,
          # the design community is open so to throttle people joining, require admin approval
          confirmed: org.slug != "design",
          role_name: Role::MEMBER_NAME,
          notify_admins_source: :link,
        )

        render_json(SuggestedOrganizationSerializer, org, view: :with_joined)
      end

      response model: OrganizationSerializer, code: 200
      def onboard
        authorize(current_organization, :update?)

        current_organization.onboarded_at = Time.current
        current_organization.save!

        render_json(OrganizationSerializer, current_organization, { view: :show })
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def avatar_presigned_fields
        authorize(current_organization, :show_presigned_fields?)

        presigned_fields = current_organization.generate_avatar_presigned_post_fields(params[:mime_type])
        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end

      private

      def current_organizations
        current_user.organizations
      end
    end
  end
end
