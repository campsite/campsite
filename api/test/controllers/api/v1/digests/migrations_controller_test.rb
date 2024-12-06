# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Digests
      class MigrationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#show" do
          test "it returns the migrated note URL" do
            digest = create(:post_digest)
            note = create(:note, member: digest.creator, original_digest_id: digest.id)

            sign_in note.member.user
            get organization_digest_migrations_path(digest.organization.slug, digest.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal note.url, json_response["note_url"]
          end

          test "it returns the nil if not migrated" do
            digest = create(:post_digest)
            note = create(:note, member: digest.creator, original_digest_id: 1234)

            sign_in note.member.user
            get organization_digest_migrations_path(digest.organization.slug, digest.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_nil json_response["note_url"]
          end
        end
      end
    end
  end
end
