# frozen_string_literal: true

class LinearEvent
  class UnsupportedTypeError < StandardError
    def message
      "unsupported Linear event type"
    end
  end

  class InvalidOrganizationError < StandardError
    def message
      "organizationId in payload does not match an active Linear integration"
    end
  end

  def self.from_payload(payload)
    raise InvalidOrganizationError unless active_integrations(payload["organizationId"]).exists?

    linear_action = payload["action"]
    linear_type = payload["type"]

    if linear_action == "create"
      case linear_type
      when LinearEvents::CreateIssue::TYPE
        return LinearEvents::CreateIssue.new(payload)
      when LinearEvents::CreateComment::TYPE
        return LinearEvents::CreateComment.new(payload)
      end
    end

    if linear_action == "update"
      case linear_type
      when LinearEvents::UpdateIssue::TYPE
        return LinearEvents::UpdateIssue.new(payload)
      end
    end

    if linear_action == "remove"
      case linear_type
      when LinearEvents::RemoveIssue::TYPE
        return LinearEvents::RemoveIssue.new(payload)
      end
    end

    raise UnsupportedTypeError
  end

  # webhooks aren't associated with an Integration, but we can check if the Linear organization is associated with a Linear integration in Campsite
  def self.active_integrations(organization_id)
    Integration.linear.joins(:data).where({
      owner_type: "Organization",
      integration_data: {
        name: IntegrationData::ORGANIZATION_ID,
        value: organization_id,
      },
    })
  end
end
