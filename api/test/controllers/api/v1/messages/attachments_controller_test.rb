# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Messages
      class AttachmentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :dm, owner: @member)
          @message = create(:message, message_thread: @thread)
        end

        context "#destroy" do
          before do
            @attachment = create(:attachment, subject: @message)
          end

          test("it removes the reaction") do
            sign_in @member.user

            assert_difference -> { Attachment.count }, -1 do
              delete organization_message_attachment_path(@organization.slug, @message.public_id, @attachment.public_id)
            end

            assert_response :no_content

            assert_equal 0, @message.reload.attachments.count
          end

          test("it queues a pusher event") do
            sign_in @member.user

            delete organization_message_attachment_path(@organization.slug, @message.public_id, @attachment.public_id)

            assert_enqueued_sidekiq_jobs(1, only: InvalidateMessageJob)
          end

          test("query count") do
            sign_in @member.user

            assert_query_count 13 do
              delete organization_message_attachment_path(@organization.slug, @message.public_id, @attachment.public_id)
            end
          end

          test("it returns an error if the user is not the sender") do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:message_thread_membership, message_thread: @thread, organization_membership: other_member)
            sign_in other_member.user

            delete organization_message_attachment_path(@organization.slug, @message.public_id, @attachment.public_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
