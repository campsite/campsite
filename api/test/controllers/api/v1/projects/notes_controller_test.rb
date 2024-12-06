# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class NotesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
        end

        context "#index" do
          before do
            @private_project = create(:project, :private, organization: @organization)
            @private_project.project_memberships.create!(organization_membership: @member)

            @open_project = create(:project, organization: @organization)

            @other_private_project = create(:project, :private, organization: @organization)

            @private_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: @private_project,
            )
            @open_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: @open_project,
            )
            @other_private_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: @other_private_project,
            )

            @non_project_note = create(:note, member: @member)
          end

          test "returns notes for open project" do
            sign_in @member.user

            get organization_project_notes_path(@organization.slug, @open_project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 1, ids.length
            assert_includes ids, @open_project_note.public_id
            assert_not_includes ids, @private_project_note.public_id
            assert_not_includes ids, @other_private_project_note.public_id
            assert_not_includes ids, @non_project_note.public_id
          end

          test "returns notes for private project" do
            sign_in @member.user

            get organization_project_notes_path(@organization.slug, @private_project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 1, ids.length
            assert_not_includes ids, @open_project_note.public_id
            assert_includes ids, @private_project_note.public_id
            assert_not_includes ids, @other_private_project_note.public_id
            assert_not_includes ids, @non_project_note.public_id
          end

          test "returns notes for private project" do
            sign_in @member.user

            get organization_project_notes_path(@organization.slug, @private_project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 1, ids.length
            assert_not_includes ids, @open_project_note.public_id
            assert_includes ids, @private_project_note.public_id
            assert_not_includes ids, @other_private_project_note.public_id
            assert_not_includes ids, @non_project_note.public_id
          end

          test "return 403 for a non-member private project" do
            sign_in create(:user)
            get organization_project_notes_path(@organization.slug, @other_private_project.public_id)
            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_notes_path(@organization.slug, @open_project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_notes_path(@organization.slug, @open_project.public_id)
            assert_response :unauthorized
          end

          test "query count" do
            create_list(
              :note,
              3,
              member: create(:organization_membership, organization: @organization),
              project: @private_project,
            )

            sign_in @member.user
            assert_query_count 15 do
              get organization_project_notes_path(@organization.slug, @private_project.public_id)
            end

            assert_response :ok
          end

          test "search returns matches" do
            match_title = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: @open_project,
              title: "Needle in a haystack",
            )
            match_description = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: @open_project,
              description_html: "This document has a needle in it",
            )

            Note.reindex

            sign_in @member.user

            get organization_project_notes_path(@organization.slug, @open_project.public_id), params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 2, ids.length
            assert_includes ids, match_title.public_id
            assert_includes ids, match_description.public_id
          end
        end
      end
    end
  end
end
