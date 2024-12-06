# frozen_string_literal: true

module Api
  module V1
    module OrganizationMemberships
      class StatusesController < BaseController
        extend Apigen::Controller

        response model: OrganizationMembershipStatusSerializer, is_array: true, code: 200
        def index
          authorize(current_organization_membership, :set_status?)

          unique_statuses = current_organization_membership.statuses.expired.group(:message).select("MAX(id)")
          last_5_statuses = OrganizationMembershipStatus.where(id: unique_statuses).order(created_at: :desc).limit(5)

          render_json(OrganizationMembershipStatusSerializer, last_5_statuses)
        end

        response model: OrganizationMembershipStatusSerializer, code: 201
        request_params do
          {
            emoji: { type: :string, required: true },
            message: { type: :string, required: true },
            expiration_setting: { type: :string, enum: OrganizationMembershipStatus::EXPIRATIONS, required: true },
            expires_at: { type: :string, required: false },
            pause_notifications: { type: :boolean, required: false },
          }
        end
        def create
          authorize(current_organization_membership, :set_status?)

          if current_organization_membership.latest_status&.active?
            return render_error(status: :unprocessable_entity, code: :invalid_request, message: "Status already set.")
          end

          expiration_setting = params[:expiration_setting]&.to_sym.presence

          status = current_organization_membership.statuses.create!({
            emoji: params[:emoji],
            message: params[:message],
            expiration_setting: expiration_setting,
            expires_at: params[:expires_at].presence || OrganizationMembershipStatus.expiration(expiration_setting),
            pause_notifications: to_bool(params[:pause_notifications]),
          })

          render_json(OrganizationMembershipStatusSerializer, status, status: :created)
        end

        response model: OrganizationMembershipStatusSerializer, code: 200
        request_params do
          {
            emoji: { type: :string, required: false },
            message: { type: :string, required: false },
            expiration_setting: { type: :string, enum: OrganizationMembershipStatus::EXPIRATIONS, required: false },
            expires_at: { type: :string, required: false },
            pause_notifications: { type: :boolean, required: false },
          }
        end
        def update
          authorize(current_organization_membership, :set_status?)

          unless current_organization_membership.latest_status&.active?
            return render_not_found
          end

          status = current_organization_membership.latest_status
          status.emoji = params[:emoji] if params.key?(:emoji)
          status.message = params[:message] if params.key?(:message)
          if params.key?(:expiration_setting)
            expiration_setting = params[:expiration_setting]&.to_sym.presence
            status.expiration_setting = expiration_setting
            status.expires_at = params[:expires_at].presence || OrganizationMembershipStatus.expiration(expiration_setting)
          end
          status.pause_notifications = to_bool(params[:pause_notifications])
          status.save!

          render_json(OrganizationMembershipStatusSerializer, status)
        end

        response code: 204
        def destroy
          authorize(current_organization_membership, :set_status?)

          unless current_organization_membership.latest_status&.active?
            return render_not_found
          end

          # Expire the status (instead of deleting it)
          current_organization_membership.latest_status.update!(expires_at: Time.current)

          head(:no_content)
        end
      end
    end
  end
end
