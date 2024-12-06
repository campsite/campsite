# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class BookmarksControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:organization_membership).user
          @organization = @user.organizations.first
          @project = create(:project, organization: @organization)
        end

        context "#index" do
          setup do
            create(:bookmark, bookmarkable: @project)
            create(:bookmark, bookmarkable: @project)
          end

          test "works for org admin" do
            sign_in @user
            get organization_project_bookmarks_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response.length
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member
            get organization_project_bookmarks_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response.length
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_project_bookmarks_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_bookmarks_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end

        context "#create" do
          test "works for an org admin" do
            sign_in @user

            assert_difference -> { @project.bookmarks.count } do
              post organization_project_bookmarks_path(@organization.slug, @project.public_id),
                params: { title: "GitHub", url: "https://github.com" }

              assert_response :created
              assert_response_gen_schema
            end
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            assert_difference -> { @project.bookmarks.count } do
              post organization_project_bookmarks_path(@organization.slug, @project.public_id),
                params: { title: "GitHub", url: "https://github.com" }

              assert_response :created
              assert_response_gen_schema
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_project_bookmarks_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_bookmarks_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end

        context "#update" do
          setup do
            @bookmark = create(:bookmark, bookmarkable: @project)
          end

          test "works for an org admin" do
            sign_in @user

            put organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id),
              params: { title: "Campsite", url: "https://campsite.com" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "Campsite", @bookmark.reload.title
            assert_equal "https://campsite.com", @bookmark.url
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            put organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id),
              params: { title: "Campsite", url: "https://campsite.com" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "Campsite", @bookmark.reload.title
            assert_equal "https://campsite.com", @bookmark.url
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            put organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)
            assert_response :unauthorized
          end
        end

        context "#reorder" do
          setup do
            @first = create(:bookmark, bookmarkable: @project)
            @second = create(:bookmark, bookmarkable: @project)
          end

          test "works for an org admin" do
            sign_in @user

            put organization_project_bookmarks_reorder_path(@organization.slug, @project.public_id),
              params: { bookmarks: [{ id: @first.public_id, position: 4 }, { id: @second.public_id, position: 2 }] }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 4, @first.reload.position
            assert_equal 2, @second.reload.position
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            put organization_project_bookmarks_reorder_path(@organization.slug, @project.public_id),
              params: { bookmarks: [{ id: @first.public_id, position: 4 }, { id: @second.public_id, position: 2 }] }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 4, @first.reload.position
            assert_equal 2, @second.reload.position
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            put organization_project_bookmarks_reorder_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put organization_project_bookmarks_reorder_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          setup do
            @bookmark = create(:bookmark, bookmarkable: @project)
          end

          test "works for an org admin" do
            sign_in @user

            assert_difference -> { @project.bookmarks.count }, -1 do
              delete organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)

              assert_response :no_content
              assert_nil Bookmark.find_by(id: @bookmark.id)
            end
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member

            assert_difference -> { @project.bookmarks.count }, -1 do
              delete organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)

              assert_response :no_content
              assert_nil Bookmark.find_by(id: @bookmark.id)
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            delete organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_project_bookmark_path(@organization.slug, @project.public_id, @bookmark.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
