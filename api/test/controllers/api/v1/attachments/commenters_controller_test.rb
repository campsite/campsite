# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Attachments
      class CommentersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#index" do
          test "returns latest commenters" do
            attachment = create(:attachment, subject: create(:post))
            comments = create_list(:comment, 6, subject: attachment.subject, attachment: attachment)
            create(:comment, subject: attachment.subject, attachment: attachment, member: comments[4].member)

            sign_in attachment.subject.member.user

            get organization_attachment_commenters_path(attachment.subject.organization.slug, attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [comments[4].member.public_id, comments[5].member.public_id, comments[3].member.public_id], json_response.pluck("id")
          end

          test "query count" do
            attachment = create(:attachment, subject: create(:post))
            comments = create_list(:comment, 6, subject: attachment.subject, attachment: attachment)
            create(:comment, subject: attachment.subject, attachment: attachment, member: comments[4].member)

            sign_in attachment.subject.member.user

            assert_query_count 3 do
              get organization_attachment_commenters_path(attachment.subject.organization.slug, attachment.public_id)
            end
          end

          test "errors for other org members" do
            attachment = create(:attachment, subject: create(:post))
            comments = create_list(:comment, 6, subject: attachment.subject, attachment: attachment)
            create(:comment, subject: attachment.subject, attachment: attachment, member: comments[4].member)

            other_member = create(:organization_membership)
            sign_in other_member.user

            get organization_attachment_commenters_path(attachment.subject.organization.slug, attachment.public_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
