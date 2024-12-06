# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Search
      class PostsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          Searchkick.enable_callbacks

          @user = create(:user, username: "foo_bar", name: "Foo Bar")
          @member = create(:organization_membership, :member, user: @user)
          @org = @member.organization

          @match_post1 = create(:post, :reindex, organization: @org, title: "match-post")
          @match_post2 = create(:post, :reindex, organization: @org, title: "matching-post")
          create(:post, :reindex, organization: @org, title: "other-post")
        end

        def teardown
          Searchkick.disable_callbacks
        end

        context "#index" do
          test "matches all results" do
            sign_in @user
            get organization_search_posts_path(@org.slug, params: { q: "match" })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@match_post1.public_id, @match_post2.public_id].sort, json_response.pluck("id").sort
          end

          test "can search for posts by a given author" do
            sign_in @user
            get organization_search_posts_path(@org.slug, params: { q: "match", author: @match_post1.member.user.username })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@match_post1.public_id].sort, json_response.pluck("id").sort
          end

          test "can search for posts by a given tag" do
            post = create(:post, :reindex, organization: @org, title: "match-post")
            tag = create(:tag, organization: @org)
            post.post_taggings.create!(tag: tag)
            post.reindex(refresh: true)

            sign_in @user

            get organization_search_posts_path(@org.slug, params: { q: "match", tag: tag.name })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [post.public_id].sort, json_response.pluck("id").sort
          end

          test "can search for posts by a project's public_id" do
            project = create(:project, organization: @org)
            post = create(:post, :reindex, organization: @org, title: "match-post", project: project)

            sign_in @user

            get organization_search_posts_path(@org.slug, params: { q: "match", project_id: project.public_id })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [post.public_id].sort, json_response.pluck("id").sort
          end

          test "can search for posts by a private project's public_id if you have permission to view it" do
            project = create(:project, private: true, name: "Foo bar", organization: @org)
            create(:project_membership, organization_membership: @member, project: project)

            post = create(:post, :reindex, organization: @org, title: "match-post", project: project)

            sign_in @user

            get organization_search_posts_path(@org.slug, params: { q: "match", project_id: project.public_id })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [post.public_id].sort, json_response.pluck("id").sort
          end

          test "can't search for posts by a private project's public_id if you don't have permission" do
            project = create(:project, private: true, name: "Foo bar", organization: @org)
            create(:post, :reindex, organization: @org, title: "match-post", project: project)

            sign_in @user

            get organization_search_posts_path(@org.slug, params: { q: "match", project_id: project.public_id })

            assert_response :ok
            assert_response_gen_schema
            assert_empty json_response
          end

          test "you can combine the search params" do
            post = create(:post, organization: @org, title: "match-post")
            project = post.project
            tag = create(:tag, organization: @org)
            post.post_taggings.create!(tag: tag)
            post.reindex(refresh: true)

            sign_in @user

            get organization_search_posts_path(@org.slug, params: { q: "match", project_id: project.public_id, author: post.member.user.username })

            assert_response :ok
            assert_response_gen_schema
            assert_equal [post.public_id], json_response.pluck("id")
          end
        end
      end
    end
  end
end
