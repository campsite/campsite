# frozen_string_literal: true

module WorkOSFixtures
  ProfileAndToken = Struct.new(:access_token, :profile, keyword_init: true)

  def workos_profile_fixture(id: nil, email: nil, organization_id: nil)
    WorkOS::Profile.new(<<~JSON)
      {
        "id": "#{id || "prof_01DMC79VCBZ0NY2099737PSVF1"}",
        "connection_id": "conn_01E4ZCR3C56J083X43JQXF3JK5",
        "connection_type": "OktaSAML",
        "organization_id": "#{organization_id || "org_01EHWNCE74X7JSDV0X3SZ3KJNY"}",
        "email": "#{email || "todd@foo-corp.com"}",
        "first_name": "Todd",
        "last_name": "Rundgren",
        "idp_id": "00u1a0ufowBJlzPlk357",
        "raw_attributes": {}
      }
    JSON
  end

  def workos_organization_fixture(id: nil)
    WorkOS::Organization.new(<<~JSON)
      {
        "object": "organization",
        "id": "#{id || "org_01EHZNVPK3SFK441A1RGBFSHRT"}",
        "name": "Foo Corp",
        "allow_profiles_outside_organization": false,
        "created_at": "2021-06-25T19:07:33.155Z",
        "updated_at": "2021-06-25T19:07:33.155Z",
        "domains": [
          {
            "id": "org_domain_01EHZNVPK2QXHMVWCEDQEKY69A",
            "object": "organization_domain",
            "domain": "foo-corp.com"
          }
        ]
      }
    JSON
  end

  def workos_connection_fixture(organization_id: nil, state: "active")
    WorkOS::Connection.new(<<~JSON)
      {
        "id": "conn_01E4ZCR3C56J083X43JQXF3JK5",
        "organization_id": "#{organization_id || "org_01EHWNCE74X7JSDV0X3SZ3KJNY"}",
        "connection_type": "OktaSAML",
        "name": "Foo Corp",
        "state": "#{state}",
        "status": "active",
        "created_at": "2021-06-25T19:07:33.155Z",
        "updated_at": "2021-06-25T19:07:33.155Z",
        "domains": [
          {
            "id": "org_domain_01EHZNVPK2QXHMVWCEDQEKY69A",
            "object": "organization_domain",
            "domain": "foo-corp.com"
          }
        ]
      }
    JSON
  end

  def workos_connections_fixture(organization_id: nil, state: "active")
    WorkOS::Types::ListStruct.new(data: [workos_connection_fixture(organization_id: organization_id, state: state)], list_metadata: {})
  end

  def sso_sign_in(user:, organization:)
    WorkOS::SSO.stubs(:profile_and_token)
      .returns(
        ProfileAndToken.new(
          access_token: "token",
          profile: workos_profile_fixture(email: user.email, organization_id: organization.workos_organization_id),
        ),
      )

    host!("auth.campsite.com")
    get(sign_in_sso_callback_path, params: { code: "workos-code" })

    assert_predicate(user.reload.workos_profile_id, :present?)
    assert_equal(session[:sso_session_id], user.workos_profile_id)
  end
end
