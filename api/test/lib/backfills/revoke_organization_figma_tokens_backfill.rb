# frozen_string_literal: true

require "test_helper"

module Backfills
  class RevokeOrganizationFigmaTokensBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      test "revokes access tokens in the specified organization" do
        member = create(:organization_membership)
        access_token = create(:access_token, resource_owner: member.user)
        non_figma_access_token = create(:access_token, application: create(:oauth_application, name: "not-figma-plugin"))
        other_org_access_token = create(:access_token)

        RevokeOrganizationFigmaTokensBackfill.run(dry_run: false, organization_slug: member.organization.slug)

        assert_predicate access_token.reload, :revoked?
        assert_not_predicate non_figma_access_token.reload, :revoked?
        assert_not_predicate other_org_access_token.reload, :revoked?
      end

      test "dry run is a no-op" do
        member = create(:organization_membership)
        access_token = create(:access_token, resource_owner: member.user)
        non_figma_access_token = create(:access_token, application: create(:oauth_application, name: "not-figma-plugin"))
        other_org_access_token = create(:access_token)

        RevokeOrganizationFigmaTokensBackfill.run(organization_slug: member.organization.slug)

        assert_not_predicate access_token.reload, :revoked?
        assert_not_predicate non_figma_access_token.reload, :revoked?
        assert_not_predicate other_org_access_token.reload, :revoked?
      end
    end
  end
end
