# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Search
      class GroupsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          Searchkick.enable_callbacks

          @user = create(:user, username: "foo_bar", name: "Foo Bar")
          @member = create(:organization_membership, :member, user: @user)
          @org = @member.organization
          @project = create(:project, organization: @org)

          @match_tag = create(:tag, organization: @org, name: "match-tag")
          create(:tag, organization: @org, name: "other-tag")

          @match_project = create(:project, organization: @org, name: "match-project")
          create(:project, organization: @org, name: "other-project")

          @match_member1 = create(:organization_membership, organization: @org, user: create(:user, username: "match_member1"))
          @match_member2 = create(:organization_membership, organization: @org, user: create(:user, username: "something_else", name: "Match Member2"))
          create(:organization_membership, organization: @org, user: create(:user, username: "other_member"))

          @match_post1 = create(:post, :reindex, organization: @org, title: "match-post")
          @match_post2 = create(:post, :reindex, organization: @org, title: "matching-post")
          create(:post, :reindex, organization: @org, title: "other-post")

          call_room = create(:call_room, organization: @org)
          @match_call = create(:call, :reindex, room: call_room, title: "match-call", peers: [create(:call_peer, organization_membership: @member)], recordings: [create(:call_recording)])
          create(:call, :reindex, room: call_room, title: "other-call", peers: [create(:call_peer, organization_membership: @member)], recordings: [create(:call_recording)])

          @match_notes = [
            create(:note, :reindex, member: create(:organization_membership, organization: @org), project: @project, project_permission: :view, title: "match note"),
            create(:note, :reindex, member: create(:organization_membership, organization: @org), project: @project, project_permission: :edit, title: "other note", description_html: "<p>match-note</p>"),
          ]
          create(:note, :reindex, member: create(:organization_membership, organization: @org), project_permission: :none, title: "match-note")
          create(:note, :reindex, member: create(:organization_membership, organization: @org), project_permission: :none, title: "other note", description_html: "<p>match-note</p>")
        end

        def teardown
          Searchkick.disable_callbacks
        end

        context "#index mixed" do
          test "matches all results" do
            sign_in @user

            assert_query_count 21 do
              get organization_search_groups_path(@org.slug, params: { q: "match" })
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@match_tag.public_id], json_response["tags"].pluck("id")
            assert_equal [@match_project.public_id], json_response["projects"].pluck("id")
            assert_equal [@match_member1.public_id, @match_member2.public_id], json_response["members"].pluck("id")
            assert_equal [@match_post1.public_id, @match_post2.public_id].sort, json_response["posts"].pluck("id").sort
            assert_equal [@match_call.public_id], json_response["calls"].pluck("id")
            assert_equal @match_notes.pluck(:public_id).sort, json_response["notes"].pluck("id").sort
            assert_equal 2, json_response["posts_total_count"]
          end

          test "returns empty on no results" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "miss" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal 0, json_response["tags"].size
            assert_equal 0, json_response["projects"].size
            assert_equal 0, json_response["members"].size
            assert_equal 0, json_response["posts"].size
            assert_equal 0, json_response["calls"].size
            assert_equal 0, json_response["notes"].size
            assert_equal 0, json_response["posts_total_count"]
          end
        end

        context "#index focused" do
          test "focuses tags" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "tags" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@match_tag.public_id], json_response["tags"].pluck("id")
            assert_equal [], json_response["projects"].pluck("id")
            assert_equal [], json_response["members"].pluck("id")
            assert_equal [], json_response["posts"].pluck("id")
            assert_equal [], json_response["calls"].pluck("id")
            assert_equal [], json_response["notes"].pluck("id")
          end

          test "focuses projects" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "projects" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["tags"].pluck("id")
            assert_equal [@match_project.public_id], json_response["projects"].pluck("id")
            assert_equal [], json_response["members"].pluck("id")
            assert_equal [], json_response["posts"].pluck("id")
            assert_equal [], json_response["calls"].pluck("id")
            assert_equal [], json_response["notes"].pluck("id")
          end

          test "focuses members" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "people" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["tags"].pluck("id")
            assert_equal [], json_response["projects"].pluck("id")
            assert_equal [], json_response["posts"].pluck("id")
            assert_equal [@match_member1.public_id, @match_member2.public_id], json_response["members"].pluck("id")
            assert_equal [], json_response["calls"].pluck("id")
            assert_equal [], json_response["notes"].pluck("id")
          end

          test "focuses posts" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "posts" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["tags"].pluck("id")
            assert_equal [], json_response["projects"].pluck("id")
            assert_includes json_response["posts"].pluck("id"), @match_post1.public_id
            assert_includes json_response["posts"].pluck("id"), @match_post2.public_id
            assert_equal [], json_response["members"].pluck("id")
            assert_equal [], json_response["calls"].pluck("id")
            assert_equal [], json_response["notes"].pluck("id")
          end

          test "focuses calls" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "calls" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["tags"].pluck("id")
            assert_equal [], json_response["projects"].pluck("id")
            assert_equal [], json_response["posts"].pluck("id")
            assert_equal [], json_response["members"].pluck("id")
            assert_equal [@match_call.public_id], json_response["calls"].pluck("id")
            assert_equal [], json_response["notes"].pluck("id")
          end

          test "focuses notes" do
            sign_in @user
            get organization_search_groups_path(@org.slug, params: { q: "match", focus: "notes" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [], json_response["tags"].pluck("id")
            assert_equal [], json_response["projects"].pluck("id")
            assert_equal [], json_response["posts"].pluck("id")
            assert_equal [], json_response["members"].pluck("id")
            assert_equal [], json_response["calls"].pluck("id")
            assert_equal @match_notes.pluck(:public_id).sort, json_response["notes"].pluck("id").sort
          end
        end
      end
    end
  end
end
