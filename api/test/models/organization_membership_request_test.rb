# frozen_string_literal: true

require "test_helper"

class OrganizationMembershipTest < ActiveSupport::TestCase
  context "send_member_request_email" do
    test "sends membership request to all org admins" do
      org = create(:organization)
      admin1 = create(:organization_membership, organization: org)
      admin2 = create(:organization_membership, organization: org)
      create(:organization_membership, :member, organization: org)
      request = create(:organization_membership_request, organization: org)

      assert_enqueued_emails 2
      assert_enqueued_email_with OrganizationMailer, :membership_request, args: [request, admin1.user]
      assert_enqueued_email_with OrganizationMailer, :membership_request, args: [request, admin2.user]
    end
  end

  context "approve!" do
    test "creates the org membership for the requestor and sends a request accepted email" do
      request = create(:organization_membership_request)
      request.approve!

      assert_nil OrganizationMembershipRequest.find_by(id: request.id)
      assert_includes request.organization.members, request.user
      assert_enqueued_email_with UserMailer, :membership_request_accepted, args: [request.user, request.organization]
    end
  end

  context "decline!" do
    test "destroys the record and sends a request declined email to requestor" do
      request = create(:organization_membership_request)
      request.decline!

      assert_nil OrganizationMembershipRequest.find_by(id: request.id)
    end
  end
end
