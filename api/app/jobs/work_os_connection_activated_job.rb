# frozen_string_literal: true

class WorkOsConnectionActivatedJob < BaseJob
  sidekiq_options queue: "background"

  def perform(id)
    conn = WorkOS::SSO.get_connection(id: id)
    return if conn.state == "inactive"

    org = Organization.find_by!(workos_organization_id: conn.organization_id)
    return if org&.enforce_sso_authentication?

    org.update_setting(:enforce_sso_authentication, true)
  end
end
