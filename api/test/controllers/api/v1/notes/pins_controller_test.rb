# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class PinsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @org = @member.organization
          @project = create(:project, organization: @org)
          @note = create(:note, member: create(:organization_membership, organization: @org))
          @note.add_to_project!(project: @project)
        end

        context "#create" do
          test "creates a pin for a note" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_note_pin_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            pin = ProjectPin.last

            assert_equal @note.public_id, json_response["pin"]["note"]["id"]
            assert_nil json_response["pin"]["post"]
            assert_equal @member, pin.pinner
            assert_equal pin.public_id, json_response["pin"]["note"]["project_pin_id"]
            assert_equal pin.public_id, json_response["pin"]["id"]
          end

          test "updates discarded pin for a note" do
            pin = create(:project_pin, pinner: @member, subject: @note, discarded_at: 5.minutes.ago)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_note_pin_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @note.public_id, json_response["pin"]["note"]["id"]
            assert_nil json_response["pin"]["post"]
            assert_equal @member, pin.pinner
            assert_equal pin.public_id, json_response["pin"]["note"]["project_pin_id"]
            assert_equal pin.public_id, json_response["pin"]["id"]

            assert_predicate pin.reload, :undiscarded?
          end

          test "returns 404 for unknown note" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_note_pin_path(@org.slug, "abcdefg")
            end

            assert_response :not_found
          end

          test "returns 403 when pinning to a private project without membership" do
            @project.update(private: true)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_note_pin_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "returns 403 when pinning a note without a project" do
            @note.update(project: nil)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_note_pin_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "creates a pin for a note in a private project" do
            @project.update(private: true)
            create(:project_membership, organization_membership: @member, project: @project)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_note_pin_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @note.public_id, json_response["pin"]["note"]["id"]
            assert_nil json_response["pin"]["post"]
            assert_equal @member, ProjectPin.last.pinner
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_note_pin_path(@org.slug, @note.public_id)
            assert_response :forbidden
          end

          test "returns 401 for unauthorized user" do
            post organization_note_pin_path(@org.slug, @note.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
