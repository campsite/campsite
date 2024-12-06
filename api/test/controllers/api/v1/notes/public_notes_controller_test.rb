# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class PublicNotesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note, title: "My Note", description_html: "<p>My description</p>")
          @org = @note.organization
        end

        context "#show" do
          test "returns forbidden unless the note is publicly visible" do
            get organization_note_public_notes_path(@org.slug, @note.public_id)

            assert_response :not_found
          end

          test "unauthenticated user can view note" do
            @note.update!(visibility: :public)
            get organization_note_public_notes_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal "My Note", json_response["title"]
            assert_equal "<p>My description</p>", json_response["description_html"]
          end

          test "query count" do
            @note.update!(visibility: :public)
            assert_query_count 2 do
              get organization_note_public_notes_path(@org.slug, @note.public_id)
            end
          end

          test "returns 404 if no organization exists with slug" do
            @note.update!(visibility: :public)
            get organization_note_public_notes_path("foobar", @note.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
