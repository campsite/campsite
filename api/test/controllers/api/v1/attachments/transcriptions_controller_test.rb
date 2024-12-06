# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Attachments
      class TranscriptionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_member = create(:organization_membership)
          @user = @user_member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization, member: @user_member)
          @attachment = create(
            :attachment,
            :video,
            subject: @post,
            file_path: "#{@organization.post_file_key_prefix}1cef4bfc-b574-4976-8fe0-961d613061e0.webm",
            file_type: "video/webm",
            transcription_job_id: "1234",
            transcription_job_status: "COMPLETED",
            transcription_vtt: "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello World\n\n",
          )
        end

        context "#show" do
          test "works for org admin" do
            sign_in @user
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "COMPLETED", json_response["status"]
          end

          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns error status when attachment doesn't have transcription_job_id" do
            @attachment.update!(transcription_job_id: nil)

            sign_in @user
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "ERROR", json_response["status"]
          end

          test "returns failed status when attachment transcription job has expired" do
            Aws::TranscribeService::Client.any_instance.expects(:get_transcription_job).raises(Aws::TranscribeService::Errors::BadRequestException.new(
              "context",
              "The requested job couldn't be found. Check the job name and try your request again.",
            ))
            @attachment.update!(transcription_job_status: "IN_PROGRESS")

            sign_in @user
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "FAILED", json_response["status"]
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)
            assert_response :forbidden
          end

          test "works for random user on public post" do
            @post.update!(visibility: "public")

            sign_in create(:user)
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "return 403 for an unauthenticated user" do
            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)
            assert_response :forbidden
          end

          test "works for unauthenticated user on public post" do
            @post.update!(visibility: "public")

            get organization_attachment_transcription_path(@organization.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 404 when the attachment is missing" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_attachment_transcription_path(@organization.slug, "missing")
            assert_response :not_found
          end
        end
      end
    end
  end
end
