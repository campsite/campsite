# frozen_string_literal: true

require "test_helper"

class LinearEventTest < ActiveSupport::TestCase
  setup do
    create(:linear_organization_id, value: "linear-org-id")
    @payload = JSON.parse(file_fixture("linear/issue_create.json").read)
    @payload["organizationId"] = "linear-org-id"
  end

  it "creates a CreateIssue event from payload" do
    event = LinearEvent.from_payload(@payload)

    assert_instance_of LinearEvents::CreateIssue, event
  end

  it "raises an UnsupportedTypeError for unsupported type" do
    @payload["type"] = "unknown_type"

    assert_raises(LinearEvent::UnsupportedTypeError) do
      LinearEvent.from_payload(@payload)
    end
  end

  it "raises an InvalidOrganizationError for an organization with no active integrations" do
    @payload["organizationId"] = "non-existent-org-id"

    assert_raises(LinearEvent::InvalidOrganizationError) do
      LinearEvent.from_payload(@payload)
    end
  end
end
