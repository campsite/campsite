# frozen_string_literal: true

module Api
  module V1
    module MessageThreads
      class OauthApplicationsController < BaseController
        extend Apigen::Controller

        response model: OauthApplicationSerializer, is_array: true, code: 200
        def index
          authorize(current_message_thread, :manage_integrations?)
          render_json(OauthApplicationSerializer, current_message_thread.oauth_applications)
        end

        response model: MessageThreadMembershipSerializer, code: 200
        request_params do
          {
            oauth_application_id: { type: :string },
          }
        end
        def create
          authorize(current_message_thread, :manage_integrations?)

          membership = current_message_thread.add_oauth_application!(
            oauth_application: oauth_application(params[:oauth_application_id]),
            actor: current_organization_membership,
          )

          render_json(MessageThreadMembershipSerializer, membership)
        end

        response code: 204
        def destroy
          authorize(current_message_thread, :manage_integrations?)

          current_message_thread.remove_oauth_application!(
            oauth_application: oauth_application(params[:id]),
            actor: current_organization_membership,
          )
        end

        private

        def current_message_thread
          @current_message_thread ||= MessageThread.eager_load(:oauth_applications).find_by!(public_id: params[:thread_id])
        end

        def oauth_application(public_id)
          @oauth_application ||= current_organization.oauth_applications.find_by!(public_id: public_id)
        end
      end
    end
  end
end
