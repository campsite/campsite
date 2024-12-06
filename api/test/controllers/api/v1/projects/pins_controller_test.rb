# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class PinsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @org = @member.organization
        end

        context "#index" do
          before do
            @project = create(:project, organization: @org)

            @posts = create_list(:post, 2, project: @project, organization: @org)
            @notes = create_list(:note, 2, project: @project, member: @member)

            @posts.each { |post| create(:project_pin, subject: post, pinner: @member, project: @project) }
            @notes.each { |note| create(:project_pin, subject: note, pinner: @member, project: @project) }
          end

          test "returns pins for an open project" do
            sign_in @member.user

            get organization_project_pins_path(@org.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 4, ids.length

            post_ids = json_response["data"].map { |el| el.dig("post", "id") }.compact
            assert_equal 2, post_ids.length
            assert_includes post_ids, @posts[0].public_id
            assert_includes post_ids, @posts[1].public_id

            note_ids = json_response["data"].map { |el| el.dig("note", "id") }.compact
            assert_equal 2, note_ids.length
            assert_includes note_ids, @notes[0].public_id
            assert_includes note_ids, @notes[1].public_id
          end

          test "ignores discarded pins" do
            sign_in @member.user

            @posts.first.pin.discard

            get organization_project_pins_path(@org.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 3, ids.length

            post_ids = json_response["data"].map { |el| el.dig("post", "id") }.compact
            assert_equal 1, post_ids.length
            assert_not_includes post_ids, @posts[0].public_id
            assert_includes post_ids, @posts[1].public_id

            note_ids = json_response["data"].map { |el| el.dig("note", "id") }.compact
            assert_equal 2, note_ids.length
            assert_includes note_ids, @notes[0].public_id
            assert_includes note_ids, @notes[1].public_id
          end

          test "returns pins for a private project" do
            @project.update!(private: true)
            create(:project_membership, organization_membership: @member, project: @project)

            sign_in @member.user

            get organization_project_pins_path(@org.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema

            ids = json_response["data"].pluck("id")
            assert_equal 4, ids.length
          end

          test "returns 403 when not a member of the private project" do
            @project.update!(private: true)
            sign_in @member.user
            get organization_project_pins_path(@org.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_pins_path(@org.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_pins_path(@org.slug, @project.public_id)
            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 41 do
              get organization_project_pins_path(@org.slug, @project.public_id)
            end
            assert_response :ok
          end
        end
      end
    end
  end
end
