# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Search
      class ResourceMentionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          Searchkick.enable_callbacks

          @user = create(:user, username: "foo_bar", name: "Foo Bar")
          @member = create(:organization_membership, :member, user: @user)
          @org = @member.organization
          @project = create(:project, organization: @org)

          @miss_post = create(:post, :reindex, organization: @org, description_html: "<p>match-post</p>", comments: [
            create(:comment, body_html: "<p>match-comment</p>"),
          ])
          @match_post = create(:post, :reindex, organization: @org, title: "match-post-title")
          @match_post_from_integration = create(:post, :reindex, :from_integration, organization: @org, title: "matchy-matchy")
          create(:post, :reindex, organization: @org, title: "other-post")

          call_room = create(:call_room, organization: @org)
          @match_call = create(:call, :reindex, room: call_room, title: "match-call", peers: [create(:call_peer, organization_membership: @member)], recordings: [create(:call_recording)])
          create(:call, :reindex, room: call_room, title: "other-call", peers: [create(:call_peer, organization_membership: @member)], recordings: [create(:call_recording)])

          @match_note = create(:note, :reindex, member: create(:organization_membership, organization: @org), project: @project, project_permission: :view, title: "match note")
          create(:note, :reindex, member: create(:organization_membership, organization: @org), project: @project, project_permission: :edit, title: "nope", description_html: "<p>match-note</p>")
          create(:note, :reindex, member: create(:organization_membership, organization: @org), project_permission: :none, title: "match-note")
          create(:note, :reindex, member: create(:organization_membership, organization: @org), project_permission: :none, title: "nope", description_html: "<p>match-note</p>")
        end

        def teardown
          Searchkick.disable_callbacks
        end

        context "#index" do
          test "matches all results" do
            sign_in @user

            assert_query_count 7 do
              get organization_search_resource_mentions_path(@org.slug, params: { q: "match" })
            end

            assert_response :ok
            assert_response_gen_schema

            matches = [@match_post, @match_post_from_integration, @match_call, @match_note]

            assert_equal 4, json_response["items"].size

            # the serializer/model uses the URL as the ID for normalization
            assert_equal matches.map(&:url).sort, json_response["items"].map { |item| item.dig("item", "id") }.sort
          end

          test "can return no results" do
            sign_in @user

            get organization_search_resource_mentions_path(@org.slug, params: { q: "zilch" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, json_response["items"].size
          end

          test "matches partial results" do
            sign_in @user

            get organization_search_resource_mentions_path(@org.slug, params: { q: "note" })

            assert_response :ok
            assert_response_gen_schema

            assert_equal 1, json_response["items"].size
            assert_equal @match_note.url, json_response["items"].first.dig("item", "id")
          end
        end
      end
    end
  end
end
