# frozen_string_literal: true

require "test_helper"

class OrganizationTest < ActiveSupport::TestCase
  context "validations" do
    test "is valid for slug with alphanumeric characters and dashes" do
      org = build(:organization, slug: "campsite-design-software")
      assert_predicate org, :valid?
    end

    test "is invalid for a slug with underscore" do
      org = build(:organization, slug: "ihaveanunderscore_")
      assert_not_predicate org, :valid?
      assert_match(/can only contain lowercase alphanumeric characters/, org.errors.full_messages.first)
    end

    test "is invalid for a slug greater than 32 characters" do
      org = build(:organization, slug: "a" * 33)
      assert_not_predicate org, :valid?
      assert_includes org.errors.full_messages, "Organization URL should be less than 32 characters."
    end

    test "is invalid for a slug that starts with or ends with underscore/dashes" do
      org = build(:organization, slug: "_starts-with")
      assert_not_predicate org, :valid?
      assert_match(/can only contain lowercase alphanumeric characters/, org.errors.full_messages.first)

      org = build(:organization, slug: "ends-with_")
      assert_not_predicate org, :valid?
      assert_match(/can only contain lowercase alphanumeric characters/, org.errors.full_messages.first)
    end

    context "email domain" do
      test "is valid for a valid email domain" do
        org = build(:organization, email_domain: "campsite.com")
        assert_predicate org, :valid?
      end

      test "is invalid for an invalid email domain" do
        org = build(:organization, email_domain: "gmail")
        assert_not_predicate org, :valid?
        assert_match(/is invalid./, org.errors.full_messages.first)
      end

      test "is invalid for an email provider domain" do
        org = build(:organization, email_domain: "gmail.com")
        assert_not_predicate org, :valid?
        assert_match(/is not supported/, org.errors.full_messages.first)
      end
    end

    context "slug" do
      test "is invalid for reserved word" do
        org = build(:organization, slug: "invitations")
        assert_not_predicate org, :valid?
        assert_match(/is a reserved word/, org.errors.full_messages.first)
      end

      test "is invalid for offensive words" do
        org = build(:organization, slug: "fuck")
        assert_not_predicate org, :valid?
        assert_match(/may contain offensive language/, org.errors.full_messages.first)
      end

      test "is not invalid for non-offensive words" do
        org = build(:organization, slug: "nigeria")
        assert_predicate org, :valid?
        assert_no_match(/may contain offensive language/, org.errors.full_messages.first)
      end
    end
  end

  context "#email_domain_matches?" do
    test "returns true if the org email domain matches the actor email domain" do
      user = build(:user, email: "ron@campsite.com")
      org = build(:organization, email_domain: "campsite.com")

      assert org.email_domain_matches?(user)
    end

    test "returns false otherwise" do
      user = build(:user, email: "ron@example.com")
      org = build(:organization, email_domain: "campsite.com")

      assert_not org.email_domain_matches?(user)
    end

    test "returns true if provided a custom domain that matches the user email domain" do
      user = build(:user, email: "ron@campsite.com")
      org = build(:organization)

      assert org.email_domain_matches?(user, "campsite.com")
    end

    test "returns false if provided a custom domain that does not match the user email domain" do
      user = build(:user, email: "ron@campsite.com")
      org = build(:organization)

      assert_not org.email_domain_matches?(user, "different.com")
    end
  end

  context "self.create_organization" do
    setup do
      @user = create(:user)
    end

    test "creates an org for the user" do
      org = Organization.create_organization(creator: @user, name: "New org", slug: "new-org-slug")
      assert_equal "new-org-slug", org.slug
      assert_not_predicate org, :demo?
      assert org.admin?(@user)
    end

    test "creates a general project and adds the admin as a project member" do
      org = Organization.create_organization(creator: @user, name: "New org", slug: "new-org-slug")
      general_project = org.general_project
      assert_equal "General", general_project.name
      assert_predicate general_project, :is_general?
      assert general_project.project_memberships.map(&:user).include?(@user)
    end

    test "raises an error for an existing org slug" do
      create(:organization, slug: "existing-slug")

      assert_raise ActiveRecord::RecordInvalid do
        Organization.create_organization(creator: @user, name: "Existing", slug: "existing-slug")
      end
    end

    test "raises an error for an invalid org slug" do
      assert_raise ActiveRecord::RecordInvalid do
        Organization.create_organization(creator: @user, name: "Existing", slug: "_invalid-name")
      end
    end
  end

  context "#create_membership!" do
    setup do
      @user = create(:user)
      @organization = create(:organization)
    end

    test "creates a membership for the user" do
      @organization.create_membership!(user: @user, role_name: :member)
      assert_includes @organization.reload.members, @user
    end

    test "creates a membership for a deactivated user" do
      deactivated = create(:organization_membership, organization: @organization, user: @user)
      deactivated.discard!
      assert_not_includes @organization.reload.members, @user

      @organization.create_membership!(user: @user, role_name: :member)
      assert_includes @organization.reload.members, @user
      assert_not deactivated.reload.discarded?
    end

    test "destroys any pending invitations" do
      invitation = create(:organization_invitation, email: @user.email, organization: @organization)

      @organization.create_membership!(user: @user, role_name: :member)
      assert_includes @organization.reload.members, @user
      assert_nil OrganizationInvitation.find_by(id: invitation.id)
    end

    test "destroys any membership requests" do
      request = create(:organization_membership_request, organization: @organization, user: @user)

      @organization.create_membership!(user: @user, role_name: :member)
      assert_includes @organization.reload.members, @user
      assert_nil OrganizationMembershipRequest.find_by(id: request.id)
    end

    test "joins the default projects and does not create notifications" do
      @admin = create(:user)
      @membership = @organization.create_membership!(user: @admin, role_name: :admin)
      @organization.projects.create!(name: "General", is_general: true, is_default: true, creator: @membership)

      @organization.create_membership!(user: @user, role_name: :member)

      organization_membership = @organization.reload.kept_memberships.find_by!(user: @user)
      project_membership = @organization.general_project.project_memberships.find_by!(organization_membership: organization_membership)
      event = project_membership.events.created_action.first!
      assert_predicate event, :skip_notifications?
      assert_no_difference -> { Notification.count } do
        event.process!
      end
    end

    test "does not join archived projects" do
      @admin = create(:user)
      @membership = @organization.create_membership!(user: @admin, role_name: :admin)
      @organization.projects.create!(name: "General", is_general: true, is_default: true, creator: @membership)
      archived_project = @organization.projects.create!(name: "Archived", archived_at: Time.now.utc, archived_by: @membership, is_default: true, creator: @membership)
      @organization.create_membership!(user: @user, role_name: :member)
      assert_includes @organization.reload.general_project.project_memberships.map(&:user), @user
      assert_not_includes archived_project.reload.project_memberships.map(&:user), @user
    end

    test "favorites the default projects" do
      @admin = create(:user)
      @membership = @organization.create_membership!(user: @admin, role_name: :admin)
      @organization.projects.create!(name: "General", is_general: true, is_default: true, creator: @membership)
      @organization.projects.create!(name: "Private", is_general: true, is_default: true, creator: @membership)
      new_membership = @organization.create_membership!(user: @user, role_name: :member)
      assert_includes new_membership.member_favorites.map(&:favoritable), @organization.reload.general_project
    end

    test "does not favorite archived default projects" do
      @admin = create(:user)
      @membership = @organization.create_membership!(user: @admin, role_name: :admin)
      @organization.projects.create!(name: "General", is_general: true, is_default: true, archived_at: Time.current, creator: @membership)
      new_membership = @organization.create_membership!(user: @user, role_name: :member)
      assert_empty new_membership.member_favorites.map(&:favoritable)
    end

    test "creates project view permissions for guests" do
      user = create(:user)
      project_1 = create(:project, organization: @organization)
      project_2 = create(:project, organization: @organization)
      @organization.create_membership!(user: user, role_name: Role::GUEST_NAME, projects: [project_1, project_2])

      project_view_permissions = user.kept_permissions.where(subject_type: "Project", action: :view)
      assert_equal 2, project_view_permissions.count
      assert_includes project_view_permissions.map(&:subject_id), project_1.id
      assert_includes project_view_permissions.map(&:subject_id), project_2.id
    end

    test "create project memberships for guests" do
      user = create(:user)
      project_1 = create(:project, organization: @organization)
      project_2 = create(:project, organization: @organization)
      general_project = create(:project, name: "General", is_general: true, is_default: true)
      member = @organization.create_membership!(user: user, role_name: Role::GUEST_NAME, projects: [project_1, project_2])

      assert_equal 2, member.kept_project_memberships.count
      assert project_1.reload.member_users.include?(user)
      assert project_2.reload.member_users.include?(user)
      assert_not general_project.reload.member_users.include?(user)
    end

    test "creates project memberships for default projects" do
      @admin = create(:user)
      @membership = @organization.create_membership!(user: @admin, role_name: :admin)
      project_1 = @organization.projects.create!(name: "General", is_general: true, is_default: true, creator: @membership)
      project_2 = @organization.projects.create!(name: "Private", is_general: true, is_default: true, creator: @membership)
      @organization.create_membership!(user: @user, role_name: :member)

      assert project_1.reload.member_users.include?(@user)
      assert project_2.reload.member_users.include?(@user)
    end
  end

  context "#invite_members" do
    setup do
      @user = create(:organization_membership).user
      @org = @user.organizations.first
      @invitations = [{ email: "ron@example.com", role: "admin" }, { email: "hagrid@example.com", role: "member" }]
    end

    test "returns a valid org invitations" do
      invitations = @org.invite_members(sender: @user, invitations: @invitations)

      assert invitations.all?(&:valid?)
      assert_equal 2, invitations.length
      assert_equal "ron@example.com", invitations.first.email
      assert_equal "admin", invitations.first.role
      assert_equal "hagrid@example.com", invitations.second.email
      assert_equal "member", invitations.second.role
    end

    test "does not create a new invitation for an existing non expired" do
      create(:organization_invitation, email: @invitations[0][:email], organization: @org)

      invitations = @org.invite_members(sender: @user, invitations: @invitations)

      assert invitations.all?(&:valid?)
      assert_equal 1, invitations.length
      assert_equal "hagrid@example.com", invitations.first.email
      assert_equal "member", invitations.first.role
    end

    test "associates an existing recipient" do
      existing_recipient = create(:user, email: "hagrid@example.com")

      assert_difference -> { OrganizationInvitation.count } do
        invitations = @org.invite_members(sender: @user, invitations: [{ email: "hagrid@example.com", role: "member" }])
        assert_predicate invitations.first, :valid?
        assert_equal existing_recipient.email, invitations.first.email
        assert_equal existing_recipient, invitations.first.recipient
      end
    end

    test "returns a new valid invitation for an expired invitation" do
      existing = create(:organization_invitation, organization: @org, email: "vold@example.com")
      existing.update!(expires_at: 1.hour.ago)
      assert_predicate existing, :expired?

      assert_no_difference -> { OrganizationInvitation.count } do
        invitations = @org.invite_members(sender: @user, invitations: [{ email: existing.email, role: "member" }])
        assert_predicate invitations.first, :valid?
        assert_equal existing.email, invitations.first.email
        # expired invitation gets deleted
        assert_nil OrganizationInvitation.find_by(id: existing.id)
      end
    end

    test "raises an error for a blank role" do
      member = create(:user)
      create(:organization_membership, organization: @org, user: member)

      assert_raise ActiveRecord::RecordInvalid do
        @org.invite_members(sender: @user, invitations: [{ email: "a@example.com", role: "" }])
      end
    end
  end

  context "#remove_member" do
    test "discards the org membership and sends an email" do
      membership = create(:organization_membership, :member)
      org = membership.organization
      assert_predicate membership, :member?

      org.remove_member(membership)

      assert_predicate membership.reload, :discarded?
      assert_empty membership.kept_project_memberships
      assert_empty org.reload.members
      assert_enqueued_emails 1
    end

    test "raises an error if its the last admin" do
      membership = create(:organization_membership)
      org = membership.organization
      assert_predicate membership, :admin?

      assert_raise Organization::RemoveMember::Error do
        org.remove_member(membership)
      end
    end
  end

  context "#avatar_url" do
    test "returns a full formed url if avatar_path is a full formed url" do
      org = build(:organization, avatar_path: "https://example.com/path/to/image.png")
      assert_includes org.avatar_url, "https://example.com/path/to/image.png"
    end

    test "returns an imgix formed url if avatar_path is a path" do
      org = build(:organization, avatar_path: "/path/to/image.png")
      assert_includes org.avatar_url, "http://campsite-test.imgix.net/path/to/image.png"
    end

    test "returns nil if avatar_path is blank" do
      org = build(:organization, id: 1, avatar_path: nil, name: "Foo bar")
      assert_includes org.avatar_url, "F.png"
    end
  end

  context "#reset_invite_token!" do
    test "updates the org invite_token" do
      org = create(:organization)
      old_token = org.invite_token

      org.reset_invite_token!
      assert_not_equal old_token, org.invite_token
    end
  end

  context "#join_slack_channel!" do
    test "joins a slack channel" do
      org = create(:integration, :slack).owner
      Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "slack-channel-id")

      org.update_slack_channel!(id: "slack-channel-id", is_private: false)
    end

    test "does not join a slack channel if its private" do
      org = create(:integration, :slack).owner
      Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "slack-channel-id").never

      org.update_slack_channel!(id: "slack-channel-id", is_private: true)
    end
  end

  context "#join" do
    test "creates a membership for the user and sends a link email" do
      org = create(:organization)
      admin = create(:organization_membership, organization: org, role_name: Role::ADMIN_NAME)
      user = create(:user)

      assert_difference -> { org.memberships.size }, 1 do
        org.join(user: user, confirmed: true, role_name: Role::MEMBER_NAME, notify_admins_source: :link)
      end

      member = OrganizationMembership.last
      assert_equal user, member.user
      assert_enqueued_email_with(OrganizationMailer, :join_via_link, args: [member, admin.user])
    end

    test "creates a membership for the user and sends a verified domain email" do
      org = create(:organization)
      admin = create(:organization_membership, organization: org, role_name: Role::ADMIN_NAME)
      user = create(:user)

      assert_difference -> { org.memberships.size }, 1 do
        org.join(user: user, confirmed: true, role_name: Role::MEMBER_NAME, notify_admins_source: :verified_domain)
      end

      member = OrganizationMembership.last
      assert_equal user, member.user
      assert_enqueued_email_with(OrganizationMailer, :join_via_verified_domain, args: [member, admin.user])
    end
  end

  context "#destroy" do
    test "deletes any associated slugs" do
      org = create(:organization, slug: :test)
      org.destroy!

      assert_empty FriendlyId::Slug.all

      org = create(:organization, slug: :test)
      assert_predicate org, :valid?
    end
  end

  context "#generate_avatar_presigned_post_fields" do
    test "returns an presigned fields for the org avatar" do
      org = create(:organization)
      fields = org.generate_avatar_presigned_post_fields("image/png")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/a/[A-Za-z0-9-]{36}\.png}, fields.key)
    end
  end

  context "#generate_post_presigned_post_fields" do
    test "returns an presigned fields for the org post file" do
      org = create(:organization)
      fields = org.generate_post_presigned_post_fields("video/mp4")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/p/[A-Za-z0-9-]{36}\.mp4}, fields.key)
    end

    test "supports origami mime type" do
      org = create(:organization)
      fields = org.generate_post_presigned_post_fields("origami")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/p/[A-Za-z0-9-]{36}\.origami}, fields.key)
    end

    test "supports principle mime type" do
      org = create(:organization)
      fields = org.generate_post_presigned_post_fields("principle")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/p/[A-Za-z0-9-]{36}\.prd}, fields.key)
    end

    test "supports lottie mime type" do
      org = create(:organization)
      fields = org.generate_post_presigned_post_fields("lottie")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/p/[A-Za-z0-9-]{36}\.json}, fields.key)
    end

    test "sets 1GB max file size for organization on free plan" do
      org = create(:organization, plan_name: Plan::FREE_NAME)
      PresignedPostFields.expects(:generate).with(has_entry({ max_file_size: 1.gigabyte }))

      org.generate_post_presigned_post_fields("video/mp4")
    end

    test "sets 1GB max file size for organization on pro plan" do
      org = create(:organization, plan_name: Plan::PRO_NAME)
      PresignedPostFields.expects(:generate).with(has_entry({ max_file_size: 1.gigabyte }))

      org.generate_post_presigned_post_fields("video/mp4")
    end
  end

  context "#generate_project_presigned_post_fields" do
    test "returns an presigned fields for the org avatar" do
      org = create(:organization)
      fields = org.generate_project_presigned_post_fields("image/png")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/prj/cp/[A-Za-z0-9-]{36}\.png}, fields.key)
    end
  end

  context ".with_slack_team_id" do
    test "returns all organizations with matching Slack team ID" do
      value = "shared-slack-team-id"
      org_with_same_slack_team_id_a = create(:organization)
      org_with_same_slack_team_id_b = create(:organization)
      org_without_same_slack_team_id = create(:organization)
      create(:slack_team_id, organization: org_with_same_slack_team_id_a, value: value)
      create(:slack_team_id, organization: org_with_same_slack_team_id_b, value: value)

      result = Organization.with_slack_team_id(value)
      assert_equal 2, result.count
      assert_includes result, org_with_same_slack_team_id_b
      assert_includes result, org_with_same_slack_team_id_a
      assert_not_includes result, org_without_same_slack_team_id
    end
  end

  context "#enforce_two_factor_authentication?" do
    test "returns true if 2fa enabled" do
      org = create(:organization)
      org.update_setting(:enforce_two_factor_authentication, true)
      assert_predicate org, :enforce_two_factor_authentication?
    end

    test "returns false otherwise" do
      org = create(:organization)
      org.update_setting(:enforce_two_factor_authentication, false)
      assert_not_predicate org, :enforce_two_factor_authentication?
    end
  end

  context "#update_setting" do
    test "works for a valid org setting" do
      org = create(:organization)
      setting = org.update_setting(:enforce_two_factor_authentication, true)
      assert_predicate setting, :valid?

      setting = org.update_setting(:enforce_two_factor_authentication, false)
      assert_predicate setting, :valid?
      assert_not_predicate org, :enforce_two_factor_authentication?
    end

    test "does not create duplicate settings" do
      org = create(:organization)
      assert_equal 0, org.settings.length

      org.update_setting(:enforce_two_factor_authentication, true)
      org.update_setting(:enforce_two_factor_authentication, false)
      assert_equal 1, org.settings.length
    end

    test "fails for an invalid org setting" do
      org = create(:organization)
      setting = org.update_setting(:invalid_setting, true)
      assert_not_predicate setting, :valid?
    end
  end

  context "workos_organization?" do
    test "returns true if workos_organization_id is present" do
      org = build(:organization, :workos)
      assert_predicate org, :workos_organization?
    end

    test "returns false if workos_organization_id is nil" do
      org = build(:organization)
      assert_not_predicate org, :workos_organization?
    end
  end

  context "#enable_sso!" do
    test "creates a workos org and updates the workos_organization_id" do
      org = create(:organization)
      domains = ["campsite.com", "example.com"]
      WorkOS::Organizations.expects(:create_organization)
        .with(name: org.name, domains: domains)
        .returns(workos_organization_fixture)

      org.enable_sso!(domains: domains)
      assert_equal workos_organization_fixture.id, org.workos_organization_id
    end

    test "raises an error for invalid domain" do
      org = create(:organization)
      domains = ["campsite.com", "example"]
      WorkOS::Organizations.expects(:create).never

      err = assert_raises(ActiveRecord::RecordInvalid) do
        org.enable_sso!(domains: domains)
      end
      assert_match(/One or more of the domains/, err.message)
      assert_nil org.reload.workos_organization_id
      assert_empty org.sso_domains
    end

    test "it raises an error if a record with the same domain has already been created" do
      org = create(:organization)
      org2 = create(:organization)
      domains = ["campsite.com"]
      WorkOS::Organizations.expects(:create_organization)
        .with(name: org.name, domains: domains)
        .returns(workos_organization_fixture)

      org.enable_sso!(domains: domains)

      err = assert_raises(ActiveRecord::RecordInvalid) do
        org2.enable_sso!(domains: domains)
      end
      assert_match(/Domain has already been taken/, err.message)
    end
  end

  context "#disable_sso!" do
    test "deletes the workos org and updates the workos_organization_id" do
      org = create(:organization, :workos)
      WorkOS::Organizations.expects(:delete_organization).with(id: org.workos_organization_id)

      org.disable_sso!
      assert_not_predicate org, :enforce_sso_authentication?
      assert_nil org.workos_organization_id
    end

    test "deletes any organization_sso_domain associations" do
      org = create(:organization, :workos)
      create(:organization_sso_domain, organization: org)
      WorkOS::Organizations.expects(:delete_organization).with(id: org.workos_organization_id)

      org.disable_sso!
      assert_not_predicate org, :enforce_sso_authentication?
      assert_empty org.sso_domains
    end

    test "noops for a non workos organization" do
      org = create(:organization)
      WorkOS::SSO.expects(:delete_organization).never
      org.disable_sso!
    end
  end

  context "#sso_portal_url" do
    test "generates an workos portal url" do
      org = create(:organization, :workos)
      WorkOS::Portal.expects(:generate_link).with(organization: org.workos_organization_id, intent: "sso")

      org.sso_portal_url
    end

    test "noops for a non workos organization" do
      org = create(:organization)
      WorkOS::SSO.expects(:generate_line).never
      assert_nil org.sso_portal_url
    end
  end

  context "#sso_connection" do
    test "returns an active workos connection" do
      org = create(:organization, :workos)
      WorkOS::SSO.expects(:list_connections).returns(workos_connections_fixture(organization_id: org.workos_organization_id))
      connection = org.sso_connection
      assert_equal workos_connection_fixture.id, connection.id
    end

    test "does not returns someone elses workos connection" do
      org = create(:organization, :workos)
      WorkOS::SSO.expects(:list_connections).returns(workos_connections_fixture)
      connection = org.sso_connection
      assert_nil connection
    end

    test "noops for a non workos organization" do
      org = create(:organization)
      WorkOS::SSO.expects(:list_connections).never
      org.sso_connection
    end
  end

  context "#features" do
    test "organization on business plan has SSO feature" do
      org = create(:organization, plan_name: Plan::BUSINESS_NAME)

      assert_includes org.features, Plan::SSO_FEATURE
    end
  end

  context "#userlist_properties" do
    test "includes plan name" do
      organization = build(:organization, plan_name: Plan::PRO_NAME)

      assert_equal "pro", organization.userlist_properties[:plan]
    end
  end

  context "#oauth_applications" do
    test "has_zapier_integration? returns true if the org has an access token for the zapier integration" do
      token = create(:access_token, :zapier)
      assert_equal true, token.resource_owner.has_zapier_integration?
    end
  end

  context "#trial_ended?" do
    test "returns true if org is on the free plan and trial_ended_at is in the past" do
      Timecop.freeze do
        organization = build(:organization, plan_name: Plan::FREE_NAME, trial_ends_at: 1.day.ago)
        assert_equal true, organization.trial_ended?
      end
    end

    test "returns false if org is on the free plan and trial_ended_at is in the future" do
      Timecop.freeze do
        organization = build(:organization, plan_name: Plan::FREE_NAME, trial_ends_at: 1.day.from_now)
        assert_equal false, organization.trial_ended?
      end
    end

    test "returns false if org is on the free plan and trial_ended_at is nil" do
      Timecop.freeze do
        organization = build(:organization, plan_name: Plan::FREE_NAME, trial_ends_at: nil)
        assert_equal false, organization.trial_ended?
      end
    end

    test "returns false if org is on the pro plan" do
      Timecop.freeze do
        organization = build(:organization, plan_name: Plan::PRO_NAME, trial_ends_at: 1.day.ago)
        assert_equal false, organization.trial_ended?
      end
    end
  end
end
