# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  context "validations" do
    test "is invalid for a weak password" do
      user = build(:user, password: "password11")

      assert_not_predicate user, :valid?
      assert_includes user.errors.full_messages, "Password is too weak"
    end

    test "is invalid if password matches email" do
      email = "nick@campsite.com"
      user = build(:user, email: email, password: email)

      assert_not_predicate user, :valid?
      assert_includes user.errors.full_messages, "Password cannot match email"
    end

    test "email" do
      assert_predicate build(:user, email: "foo@bar.com"), :valid?
      assert_predicate build(:user, email: "foo.bar@bar.co.uk"), :valid?
      assert_not_predicate build(:user, email: "foo@bar"), :valid?
      assert_not_predicate build(:user, email: "foo.bar"), :valid?
    end

    context "username" do
      test "sets username from email on create" do
        user = create(:user, email: "boomerang@example.com", username: nil)
        assert_equal "boomerang", user.username
      end

      test "handles existing username conflicts" do
        existing = create(:user, email: "username.should.have.a.conflict@example.com", username: nil)
        assert_predicate existing, :valid?
        assert_equal "username_should_have_a_conflic", existing.username

        new_user = create(:user, email: "username.should.have.a.conflict@gmail.com", username: nil)
        assert_equal "username_should_have_a_confl1", new_user.username
      end

      test "is valid for alphanumeric and underscore chracters" do
        user = build(:user, username: "_abc_")

        assert_predicate user, :valid?
      end

      test "is invalid with just an underscore" do
        user = create(:user)
        user.update(username: "_")

        assert_not_predicate user, :valid?
        assert_includes user.errors.full_messages, "Username can only contain alphanumeric characters and underscores."
      end

      test "is invalid when greather than 30 characters" do
        user = create(:user)
        user.update(username: "a" * 31)

        assert_not_predicate user, :valid?
        assert_includes user.errors.full_messages, "Username should be less than 30 characters."
      end

      test "is invalid if it contains non alphanumeric characters" do
        user = create(:user)
        user.update(username: "abcd.$%")

        assert_not_predicate user, :valid?
        assert_includes user.errors.full_messages, "Username can only contain alphanumeric characters and underscores."
      end

      test "is invalid if it is reserved" do
        user = create(:user)
        user.update(username: "me")

        assert_not_predicate user, :valid?
        assert_includes user.errors.full_messages, "Username me is reserved."
      end

      test "is invalid if it contains offensive language" do
        user = create(:user)
        user.update(username: "fuck")

        assert_not_predicate user, :valid?
        assert_includes user.errors.full_messages, "Username may contain offensive language"
      end

      test "is valid if it contains contextually inoffensive language" do
        user = create(:user)
        user.update(username: "jackson_pollock")

        assert_predicate user, :valid?
        assert_not_includes user.errors.full_messages, "Username may contain offensive language"
      end

      test "handles conflicts with reserved names on create" do
        user = create(:user, email: "me@campsite.com", username: nil)
        assert_equal "me1", user.username
      end

      test "downcases usernames before saving" do
        user = create(:user, username: "ABA")
        assert_equal "aba", user.username
      end
    end
  end

  context "#from_omniauth" do
    setup do
      @omni_auth = OmniAuth::AuthHash.new({
        provider: "google_oauth2",
        uid: 12,
        info: {
          email: "harry@example.com",
          name: "Harry Potter",
        },
      })
    end

    test "creates and confirms a new user with the provider and uid, " do
      user = User.from_omniauth(@omni_auth)

      assert_predicate user, :valid?
      assert_equal "harry@example.com", user.email
      assert_equal "Harry Potter", user.name
      assert_equal "google_oauth2", user.omniauth_provider
      assert_equal "12", user.omniauth_uid
      assert_predicate user, :confirmed?
    end

    test "updates an existing user's email from the provider" do
      create(:user, name: "Ron", omniauth_provider: "google_oauth2", omniauth_uid: "12")

      assert_no_difference -> { User.count } do
        user = User.from_omniauth(@omni_auth)

        assert_equal "Ron", user.reload.name
        assert_equal "harry@example.com", user.email
        assert_equal "google_oauth2", user.omniauth_provider
        assert_equal "12", user.omniauth_uid
      end
    end

    test "creates a user with image if present" do
      omni_auth = OmniAuth::AuthHash.new({
        provider: "google_oauth2",
        uid: 12,
        info: {
          email: "harry@example.com",
          name: "Harry Potter",
          image: "https://example.com/image.png",
        },
      })

      user = User.from_omniauth(omni_auth)

      assert_predicate user, :valid?
      assert_equal "https://example.com/image.png", user.avatar_path
      assert_enqueued_sidekiq_job(ImportRemoteUserAvatarJob, args: [user.id])
    end

    test "does not enqueue job to import avatar if user isn't persisted" do
      omni_auth = OmniAuth::AuthHash.new({
        provider: "google_oauth2",
        uid: 12,
        info: {
          # invalid - missing email
          email: nil,
          name: "Harry Potter",
          image: "https://example.com/image.png",
        },
      })

      user = User.from_omniauth(omni_auth)

      assert_not_predicate user, :valid?
      refute_enqueued_sidekiq_job(ImportRemoteUserAvatarJob, args: [user.id])
    end

    test "does not create a user with an image if the url is too long" do
      omni_auth = OmniAuth::AuthHash.new({
        provider: "google_oauth2",
        uid: 12,
        info: {
          email: "harry@example.com",
          name: "Harry Potter",
          image: "x" * 256,
        },
      })

      user = User.from_omniauth(omni_auth)

      assert_predicate user, :valid?
      assert_nil user.avatar_path
    end

    test "adds the user to any suggested organization with the same email domain" do
      org = create(:organization, email_domain: "example.com")

      user = User.from_omniauth(@omni_auth)
      assert org.member?(user)
    end

    test "updates an existing user with a confirmed matching email address and no omniauth provider" do
      user = create(:user, email: @omni_auth.info.email, omniauth_provider: nil, omniauth_uid: nil)

      result = User.from_omniauth(@omni_auth)
      user.reload

      assert_equal user, result
      assert_equal @omni_auth.provider, user.omniauth_provider
      assert_equal @omni_auth.uid.to_s, user.omniauth_uid
    end

    test "does not update an existing user with an unconfirmed matching email address" do
      user = create(:user, email: @omni_auth.info.email, confirmed_at: nil, omniauth_provider: nil, omniauth_uid: nil)

      result = User.from_omniauth(@omni_auth)

      assert_not_predicate result, :valid?
      assert_nil user.reload.omniauth_provider
      assert_nil user.omniauth_uid
    end

    test "does not update an existing user with a different omniauth UID" do
      original_omniauth_uid = "something-else"
      user = create(:user, email: @omni_auth.info.email, omniauth_provider: "google_oauth2", omniauth_uid: original_omniauth_uid)

      result = User.from_omniauth(@omni_auth)

      assert_not_predicate result, :valid?
      assert_equal original_omniauth_uid, user.reload.omniauth_uid
    end
  end

  context "#managed?" do
    test "returns true if the user is managed through omniauth" do
      user = build(:user, :omniauth)
      assert_predicate user, :managed?
    end

    test "returns false otherwise" do
      user = build(:user)
      assert_not_predicate user, :managed?
    end
  end

  context "managed_provider" do
    test "returns google for omniauth managaed user" do
      user = build(:user, :omniauth)
      assert_equal "google", user.managed_provider
    end

    test "return nil otherwisse" do
      user = build(:user)
      assert_nil user.managed_provider
    end
  end

  context "#create_default_schedule" do
    test "creates a default weekly digest schedule after creating the user" do
      assert_difference -> { ScheduledNotification.count }, 2 do
        user = create(:user)
        assert_equal "weekly_digest", user.scheduled_notifications.first.name
        assert_equal "daily_digest", user.scheduled_notifications.second.name
      end
    end
  end

  context "#avatar_url" do
    test "returns a full formed url if avatar_path is a full formed url" do
      user = build(:user, avatar_path: "https://example.com/path/to/image.png")
      assert_includes user.avatar_url, "https://example.com/path/to/image.png"
    end

    test "returns an imgix formed url if avatar_path is a path" do
      user = build(:user, avatar_path: "/path/to/image.png")
      assert_includes user.avatar_url, "http://campsite-test.imgix.net/path/to/image.png"
    end

    test "returns fallback if avatar_path is blank" do
      user = build(:user, id: 1, avatar_path: nil, name: "Foo bar")
      assert_includes user.avatar_url, "F.png"
    end
  end

  context "#organizations" do
    test "returns user organizations" do
      user = create(:user)
      membership = create(:organization_membership, user: user)

      assert_includes user.organizations, membership.organization
    end

    test "does not include discarded organization memberships" do
      user = create(:user)
      membership = create(:organization_membership, user: user)
      membership.discard!

      assert_empty user.reload.organizations
    end
  end

  context "#verified_domain_organizations" do
    test "returns a list of orgs with a similar email domain as the user" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      ron_org = create(:organization, name: "ron", email_domain: "example.com")
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 2, user.verified_domain_organizations.length
      assert_includes user.verified_domain_organizations, harry_org
      assert_includes user.verified_domain_organizations, hagrid_org
      assert_not_includes user.verified_domain_organizations, ron_org
    end

    test "does not include orgs that a user has membership" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      create(:organization_membership, organization: harry_org, user: user)
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 1, user.verified_domain_organizations.length
      assert_includes user.verified_domain_organizations, hagrid_org
      assert_not_includes user.verified_domain_organizations, harry_org
    end
  end

  context "#suggested_organizations" do
    test "includes orgs with a similar email domain as the user" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      ron_org = create(:organization, name: "ron", email_domain: "example.com")
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 2, user.suggested_organizations.length
      assert_includes user.suggested_organizations, harry_org
      assert_includes user.suggested_organizations, hagrid_org
      assert_not_includes user.suggested_organizations, ron_org
    end

    test "includes orgs that a user has requested membership" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      ron_org = create(:organization, name: "ron", email_domain: "example.com")
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")
      create(:organization_membership_request, organization: hagrid_org, user: user)

      assert_equal 2, user.reload.suggested_organizations.length
      assert_includes user.suggested_organizations, harry_org
      assert_includes user.suggested_organizations, hagrid_org
      assert_not_includes user.suggested_organizations, ron_org
    end

    test "does not include orgs that a user has membership" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      create(:organization_membership, organization: harry_org, user: user)
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 1, user.suggested_organizations.length
      assert_includes user.suggested_organizations, hagrid_org
      assert_not_includes user.suggested_organizations, harry_org
    end

    test "does not include orgs that a user has been deactivated" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      create(:organization_membership, organization: harry_org, user: user).discard!
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 1, user.suggested_organizations.length
      assert_includes user.suggested_organizations, hagrid_org
      assert_not_includes user.suggested_organizations, harry_org
    end

    test "does not include orgs that a user has an invitation" do
      user = create(:user, email: "#{Faker::Internet.username}@campsite.com")

      harry_org = create(:organization, name: "harry", email_domain: "campsite.com")
      create(:organization_invitation, organization: harry_org, recipient: user)
      hagrid_org = create(:organization, name: "hagrid", email_domain: "campsite.com")

      assert_equal 1, user.suggested_organizations.length
      assert_includes user.suggested_organizations, hagrid_org
      assert_not_includes user.suggested_organizations, harry_org
    end
  end

  context "#weekly_digest_enabled?" do
    test "returns true if a weekly_digest schedule exists" do
      user = create(:user)
      assert_predicate user, :weekly_digest_enabled?
    end

    test "returns false otherwise" do
      user = create(:user)
      user.scheduled_notifications.destroy_all

      assert_not_predicate user, :weekly_digest_enabled?
    end
  end

  context "#generate_avatar_presigned_post_fields" do
    test "returns an presigned fields for the org avatar" do
      user = create(:user)
      fields = user.generate_avatar_presigned_post_fields("image/png")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{u/#{user.public_id}/a/[A-Za-z0-9-]{36}\.png}, fields.key)
    end
  end

  context "#generate_cover_photo_presigned_post_fields" do
    test "returns an presigned fields for the org avatar" do
      user = create(:user)
      fields = user.generate_cover_photo_presigned_post_fields("image/png")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{u/#{user.public_id}/cp/[A-Za-z0-9-]{36}\.png}, fields.key)
    end
  end

  context "#generate_login_token!" do
    test "sets the login_tokin, login_token and login_token_expires_at" do
      user = create(:user)
      assert_nil user.login_token
      assert_nil user.login_token_expires_at

      user.generate_login_token!
      assert_not_nil user.login_token
      assert_not_nil user.login_token_expires_at
    end
  end

  context "#reset_login_token!" do
    test "sets the login_token and login_token_expires_at" do
      user = create(:user, login_token: "token", login_token_expires_at: Time.current)
      user.reset_login_token!

      assert_nil user.login_token
      assert_nil user.login_token_expires_at
    end
  end

  context "#login_token_expired?" do
    test "returns false if token is valid" do
      user = create(:user, login_token: "token", login_token_expires_at: 5.minutes.from_now)

      assert_not_predicate user, :login_token_expired?
    end

    test "returns true if token is expired" do
      user = create(:user, login_token: "token", login_token_expires_at: 5.minutes.ago)

      assert_predicate user, :login_token_expired?
    end

    test "returns true if token is expired" do
      user = create(:user, login_token: "token", login_token_expires_at: 5.minutes.ago)

      assert_predicate user, :login_token_expired?
    end

    test "returns true if token is nil" do
      user = create(:user, login_token: nil, login_token_expires_at: nil)

      assert_predicate user, :login_token_expired?
    end

    test "returns true if login_token_expires_at is nil" do
      user = create(:user, login_token: "token", login_token_expires_at: nil)

      assert_predicate user, :login_token_expired?
    end
  end

  context "#valid_login_token?" do
    test "returns true for a valid token" do
      user = create(:user, login_token: "token")

      assert user.valid_login_token?("token")
    end

    test "returns false for an invalid token" do
      user = create(:user, login_token: "token")

      assert_not user.valid_login_token?("invalid")
    end
  end

  context "#generate_two_factor_secret" do
    test "generates a otp_secret if its nil" do
      user = create(:user)
      assert_nil user.otp_secret

      user.generate_two_factor_secret!
      assert_not_nil user.otp_secret
    end
  end

  context "#enable_two_factor!" do
    test "updates otp_enabled to be true" do
      user = create(:user)
      assert_not_predicate user, :otp_enabled?

      user.enable_two_factor!
      assert_predicate user, :otp_enabled?
    end
  end

  context "#disable_two_factor!" do
    test "resets otp_backup_codes, otp_secret and otp_enabled" do
      user = create(:user, otp_secret: "secret", otp_enabled: true, otp_backup_codes: ["a", "b", "c"])
      user.disable_two_factor!

      assert_nil user.otp_secret
      assert_empty user.otp_backup_codes
      assert_not_predicate user, :otp_enabled?
    end
  end

  context "#two_factor_provisioning_uri" do
    test "returns a 2fa provisioning uri" do
      user = create(:user, email: "otp@example.com", otp_secret: "secret")
      expected_uri = "otpauth://totp/Campsite:#{user.email}?secret=secret&issuer=Campsite"
      assert_equal expected_uri, user.two_factor_provisioning_uri
    end
  end

  context "#two_factor_backup_codes_generated?" do
    test "returns true if otp_backup_codes present" do
      user = create(:user, otp_backup_codes: ["a", "b", "c"])
      assert_predicate user, :two_factor_backup_codes_generated?
    end

    test "returns false if otp_backup_codes blank" do
      user = create(:user, otp_backup_codes: [])
      assert_not_predicate user, :two_factor_backup_codes_generated?
    end
  end

  context "#subscriptions" do
    test "returns a collection of the user's subscriptions" do
      subscription = create(:user_subscription)
      user = subscription.user

      assert_equal [subscription], user.subscriptions
    end
  end

  context "#unread_counts" do
    test "does not include self messages or chat project messages in unread counts" do
      # not calling MessageThread#send_message! because we want to bypass marking read

      dm1 = create(:message_thread, :dm)
      user = dm1.owner.user

      dm1.messages.create!(sender: dm1.owner, content: "hello")

      dm2 = create(:message_thread, :dm, owner: create(:organization_membership, user: user))
      dm2.messages.create!(sender: dm2.organization_memberships[1], content: "hey")

      dm3 = create(:message_thread, :dm, owner: create(:organization_membership, user: user))
      dm3.messages.create!(sender: dm3.owner, content: "hello")
      dm3.messages.create!(sender: dm3.organization_memberships[1], content: "hey")

      group = create(:message_thread, :group, owner: create(:organization_membership, user: user))
      group.messages.create!(sender: group.owner, content: "hello")
      group.messages.create!(sender: group.organization_memberships[1], content: "hey")
      group.messages.create!(sender: group.owner, content: "sup")
      group.messages.create!(sender: group.organization_memberships[2], content: "ho ho ho")

      chat_project_thread = create(:message_thread, :group, owner: create(:organization_membership, user: user))
      create(:project, organization: chat_project_thread.organization, message_thread: chat_project_thread)
      chat_project_thread.messages.create!(sender: chat_project_thread.organization_memberships[1], content: "hey")

      counts = user.unread_message_counts_by_org_slug_async.value

      assert_nil counts[dm1.organization.slug]
      assert_equal 1, counts[dm2.organization.slug]
      assert_equal 1, counts[dm3.organization.slug]
      assert_equal 1, counts[group.organization.slug]
      assert_nil counts[chat_project_thread.organization.slug]
    end

    test "does not include deactivated memberships" do
      dm = create(:message_thread, :dm)
      member = dm.organization_memberships.first
      member.discard

      assert_equal({}, member.user.unread_message_counts_by_org_slug_async.value)
    end
  end

  context "#userlist_properties" do
    test "post_count doesn't include draft posts" do
      user = create(:user)
      member = create(:organization_membership, user: user)
      create(:post, :draft, member: member)

      assert_equal 0, user.userlist_properties[:post_count]
    end
  end
end
