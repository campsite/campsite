# frozen_string_literal: true

require "test_helper"

class OrganizationInvitationTest < ActiveSupport::TestCase
  context "invite_token" do
    test "generates a unique invite token on create" do
      org = create(:organization)
      inv_a = create(:organization_invitation, organization: org)
      inv_b = create(:organization_invitation, organization: org)

      assert_predicate inv_a.invite_token, :present?
      assert_predicate inv_b.invite_token, :present?
      assert_not_equal inv_a.invite_token, inv_b.invite_token
    end
  end

  context "send_invitation_email" do
    test "enqueues invite_member email" do
      invitation = create(:organization_invitation)
      assert_enqueued_emails 1
      assert_enqueued_email_with OrganizationMailer, :invite_member, args: [invitation]
    end
  end

  context "#accept!" do
    setup do
      @organization = create(:organization)
      @invitation = create(:organization_invitation, :with_recipient, organization: @organization)
    end

    test "creates an org membership and destroys the invitation" do
      membership = @invitation.accept!(@invitation.recipient)

      assert_predicate membership, :valid?
      assert_nil OrganizationInvitation.find_by(id: @invitation.id)
      assert_includes @invitation.organization.members, membership.user
    end

    test "raises an error if the invite email does not match the current user email" do
      assert_raises OrganizationInvitation::AcceptError do
        random_user = create(:user)
        @invitation.accept!(random_user)
      end
    end

    test "raises an error if invitation has expired" do
      @invitation.update!(expires_at: 1.hour.ago)
      assert_predicate @invitation, :expired?

      assert_raises OrganizationInvitation::AcceptError do
        @invitation.accept!(@invitation.recipient)
      end
    end
  end

  context ".create!" do
    before(:each) do
      @org = create(:organization)
      create_list(:organization_invitation, 1, organization: @org)
      create_list(:organization_membership, 2, organization: @org)
    end

    test "allows invite when existing active members + member invitations equals 3 on the pro plan" do
      @org.update!(plan_name: Plan::PRO_NAME)

      assert_difference -> { @org.invitations.count }, 1 do
        create(:organization_invitation, :member, organization: @org)
      end
    end

    test "allows viewer invite when existing active members + member invitations equals 3 on the free plan" do
      @org.update!(plan_name: Plan::FREE_NAME)

      assert_difference -> { @org.invitations.count }, 1 do
        create(:organization_invitation, :viewer, organization: @org)
      end
    end
  end
end
