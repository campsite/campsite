# frozen_string_literal: true

require "test_helper"

class WorkOsConnectionActivatedJobTest < ActiveJob::TestCase
  context "perform" do
    test "noop for inactive connection" do
      WorkOS::SSO.expects(:get_connection).returns(workos_connection_fixture(state: "inactive"))
      Organization.expects(:find_by!).never

      WorkOsConnectionActivatedJob.new.perform("conn_id")
    end

    test "noop for org with enforce_sso_authentication" do
      org = create(:organization, workos_organization_id: "org_id")
      org.update_setting(:enforce_sso_authentication, true)
      assert_predicate org, :enforce_sso_authentication?

      WorkOS::SSO.expects(:get_connection).returns(
        workos_connection_fixture(organization_id: org.workos_organization_id, state: "active"),
      )
      Organization.any_instance.expects(:update_setting).never

      WorkOsConnectionActivatedJob.new.perform("conn_id")
    end

    test "updates org to enforce_sso_authentication" do
      org = create(:organization, workos_organization_id: "org_id")
      assert_not_predicate org, :enforce_sso_authentication?

      WorkOS::SSO.expects(:get_connection).returns(
        workos_connection_fixture(organization_id: org.workos_organization_id, state: "active"),
      )

      WorkOsConnectionActivatedJob.new.perform("conn_id")
      assert_predicate org.reload, :enforce_sso_authentication?
    end
  end
end
