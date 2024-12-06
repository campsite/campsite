# frozen_string_literal: true

require "test_helper"

class ApiActorTest < ActiveSupport::TestCase
  setup do
    @member = create(:organization_membership)
    @org = @member.organization
    @application = create(:oauth_application, owner: @org, creator: @member)
  end

  context "#access_token" do
    test "only returns an organization if the actor is an org-scoped access token" do
      token = create(:access_token, resource_owner: @org, application: @application)

      actor = ApiActor.new(access_token: token, org_slug: @org.slug)

      assert actor.organization_scope?
      assert_equal @application, actor.application
      assert_equal @org, actor.organization
      assert_nil actor.organization_membership
      assert_nil actor.user
      assert actor.confirmed?
    end

    test "returns an org, member, and user if the actor is a user-scoped access token with an org slug" do
      token = create(:access_token, resource_owner: @member.user, application: @application)

      actor = ApiActor.new(access_token: token, org_slug: @org.slug)

      assert_not actor.organization_scope?
      assert_equal @application, actor.application
      assert_equal @org, actor.organization
      assert_equal @member, actor.organization_membership
      assert_equal @member.user, actor.user
      assert actor.confirmed?
    end
  end

  context "#oauth_application" do
    test "only returns an organization if the actor is an org-owned application" do
      application = create(:oauth_application, owner: @member.organization, creator: @member)
      actor = ApiActor.new(oauth_application: application)

      assert actor.organization_scope?
      assert_equal application, actor.application
      assert_equal @member.organization, actor.organization
      assert_nil actor.organization_membership
      assert_nil actor.user
      assert actor.confirmed?
    end

    test "returns a user if the actor is a user-owned application" do
      application = create(:oauth_application, owner: @member.user)
      actor = ApiActor.new(oauth_application: application)

      assert_not actor.organization_scope?
      assert_equal application, actor.application
      assert_equal @member.user, actor.user
      assert_nil actor.organization
      assert_nil actor.organization_membership
      assert actor.confirmed?
    end

    test "does not return confirmed if the application is discarded" do
      application = create(:oauth_application, owner: @member.organization, creator: @member)
      application.discard

      actor = ApiActor.new(oauth_application: application)

      assert_not actor.confirmed?
    end
  end

  context "#user" do
    test "only returns a user if the actor is a user" do
      actor = ApiActor.new(user: @member.user)

      assert_not actor.organization_scope?
      assert_nil actor.application
      assert_equal @member.user, actor.user
      assert_nil actor.organization
      assert_nil actor.organization_membership
      assert actor.confirmed?
    end

    test "does not return confirmed if the user is not confirmed" do
      actor = ApiActor.new(user: create(:user, :unconfirmed))

      assert_not actor.confirmed?
    end
  end
end
