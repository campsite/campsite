# frozen_string_literal: true

module CurrentAttributable
  extend ActiveSupport::Concern

  PUSHER_SOCKET_ID_HEADER = "X-Pusher-Socket-Id"

  included do
    before_action :set_current_user
    before_action :set_current_organization
    before_action :set_current_organization_membership
    before_action :set_host
    before_action :set_pusher_socket_id
  end

  def set_current_user
    if user_signed_in?
      Current.user = current_user
    end
  end

  def set_current_organization
    if defined?(:current_organization) && current_organization.present?
      Current.organization = current_organization
    end
  end

  def set_current_organization_membership
    if defined?(current_organization_membership) && current_organization_membership.present?
      Current.organization_membership = current_organization_membership
    end
  end

  def set_host
    Current.host = request.protocol + request.host_with_port
  end

  def set_pusher_socket_id
    if request.headers[PUSHER_SOCKET_ID_HEADER].present?
      Current.pusher_socket_id = request.headers[PUSHER_SOCKET_ID_HEADER]
    end
  end
end
