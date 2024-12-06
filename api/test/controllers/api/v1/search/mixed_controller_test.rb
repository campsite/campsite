# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Search
      class MixedControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          Searchkick.enable_callbacks

          @user = create(:user, username: "foo_bar", name: "Foo Bar")
          @member = create(:organization_membership, :member, user: @user)
          @org = @member.organization
          @project = create(:project, organization: @org)

          @match_post1 = create(:post, :reindex, organization: @org, description_html: "<p>match-post</p>", comments: [
            create(:comment, body_html: "<p>match-comment</p>"),
          ])
          @match_post2 = create(:post, :reindex, organization: @org, title: "match-post-title")
          @match_post_from_integration = create(:post, :reindex, :from_integration, organization: @org, title: "matchy-matchy")
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

        context "#index" do
          test "matches all results" do
            sign_in @user

            assert_query_count 7 do
              get organization_search_mixed_index_path(@org.slug, params: { q: "match" })
            end

            assert_response :ok
            assert_response_gen_schema

            assert_equal 6, json_response["items"].size
            assert_equal [@match_post1, @match_post2, @match_post_from_integration].pluck(:public_id).sort, json_response["posts"].pluck("id").sort
            assert_equal "Zapier", json_response["posts"].find { |p| p["id"] == @match_post_from_integration.public_id }.dig("member", "user", "display_name")
            assert_equal [@match_call].pluck(:public_id).sort, json_response["calls"].pluck("id").sort
            assert_equal @match_notes.pluck(:public_id).sort, json_response["notes"].pluck("id").sort
          end

          test "can return no results" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "zilch" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, json_response["items"].size
            assert_equal 0, json_response["posts"].size
            assert_equal 0, json_response["calls"].size
            assert_equal 0, json_response["notes"].size
          end

          test "matches partial results" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "note" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response["items"].size
            assert_equal 0, json_response["posts"].size
            assert_equal 0, json_response["calls"].size
            assert_equal 2, json_response["notes"].size
          end

          test "includes highlights" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "match" })

            assert_response :ok
            assert_response_gen_schema

            post_1 = json_response["items"].find { |item| item["id"] == @match_post1.public_id }
            post_2 = json_response["items"].find { |item| item["id"] == @match_post2.public_id }
            note_1 = json_response["items"].find { |item| item["id"] == @match_notes[1].public_id }

            assert_equal [
              "<span class='search-highlight'>match</span>-comment",
              "<span class='search-highlight'>match</span>-post",
            ],
              post_1["highlights"]

            assert_equal "<span class='search-highlight'>match</span>-post-title", post_2["title_highlight"]

            assert_equal ["<span class='search-highlight'>match</span>-note"], note_1["highlights"]
          end

          test "focuses posts" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "match", focus: "posts" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response["items"].size
            assert_equal 3, json_response["posts"].size
            assert_equal 0, json_response["calls"].size
            assert_equal 0, json_response["notes"].size
          end

          test "focuses calls" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "match", focus: "calls" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 1, json_response["items"].size
            assert_equal 0, json_response["posts"].size
            assert_equal 1, json_response["calls"].size
            assert_equal 0, json_response["notes"].size
          end

          test "focuses notes" do
            sign_in @user

            get organization_search_mixed_index_path(@org.slug, params: { q: "match", focus: "notes" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response["items"].size
            assert_equal 0, json_response["posts"].size
            assert_equal 0, json_response["calls"].size
            assert_equal 2, json_response["notes"].size
          end
        end
      end
    end
  end
end
