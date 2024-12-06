# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Notes
      module Attachments
        class ReordersControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @note = create(:note)
            @member = @note.member
            @organization = @member.organization
            @attachments = [
              create(:attachment, subject: @note, gallery_id: "foo"),
              create(:attachment, subject: @note, gallery_id: "foo"),
              create(:attachment, subject: @note, gallery_id: "foo"),
              create(:attachment, subject: @note),
            ]
          end

          context "#update" do
            test "works for author" do
              assert_equal @attachments, @note.reload.attachments

              sign_in @member.user

              assert_query_count 6 do
                put organization_note_attachment_reorder_path(
                  @organization.slug,
                  @note.public_id,
                  attachments: [
                    { id: @attachments[1].public_id, position: 0 },
                    { id: @attachments[0].public_id, position: 1 },
                    { id: @attachments[2].public_id, position: 2 },
                  ],
                  as: :json,
                )
              end

              assert_response :no_content
              assert_position(@attachments[1].id, 0)
              assert_position(@attachments[0].id, 1)
              assert_position(@attachments[2].id, 2)
              assert_position(@attachments[3].id, 0)
            end

            test "returns 404 if attachment not found" do
              sign_in @member.user

              put organization_note_attachment_reorder_path(
                @organization.slug,
                @note.public_id,
                attachments: [
                  { id: "not-a-real-id", position: 0 },
                ],
              )

              assert_response :not_found
            end

            test "return 403 for a random user" do
              sign_in create(:user)
              put organization_note_attachment_reorder_path(@organization.slug, @note.public_id, attachments: [])
              assert_response :forbidden
            end

            private

            def assert_position(attachment_id, position)
              assert_equal(position, @note.attachments.find_by(id: attachment_id).position)
            end
          end
        end
      end
    end
  end
end
