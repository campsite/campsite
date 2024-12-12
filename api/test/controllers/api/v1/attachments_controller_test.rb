# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class AttachmentsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#posts" do
        before do
          @post = create(:post, :with_attachments)
          @member = @post.member
          @org = @member.organization
          @attachment = @post.sorted_attachments.first
        end

        context "#create" do
          test "user can create attachment" do
            sign_in(@member.user)

            attachment_name = "my-image.png"
            attachment_size = 1.megabyte

            post organization_attachments_path(@org.slug),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: attachment_name, size: attachment_size },
              as: :json

            assert_response :created
            assert_response_gen_schema

            assert_equal attachment_name, json_response["name"]
            assert_equal attachment_size, json_response["size"]
            assert_not json_response["subject_id"]
            assert_not json_response["subject_type"]
          end

          test "non org member cannot create attachment" do
            other_member = create(:organization_membership, :member)
            sign_in(other_member.user)

            post organization_attachments_path(@org.slug),
              params: { file_type: "image/png", file_path: "/path/to/image1.png" },
              as: :json

            assert_response :forbidden
          end
        end

        context "#show" do
          test "author can show attachment" do
            sign_in(@member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "non author can show attachment" do
            other_member = create(:organization_membership, :member, organization: @org)
            sign_in(other_member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "can show detached attachment" do
            detached_attachment = create(:attachment, subject: nil)

            sign_in(@member.user)
            get organization_attachment_path(@org.slug, detached_attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal detached_attachment.public_id, json_response["id"]
          end

          test "non org member cannot show attachment" do
            other_member = create(:organization_membership, :member)
            sign_in(other_member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end

          test "includes commenters" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:comment, subject: @post, attachment: @attachment, member: @member)
            create(:comment, subject: @post, attachment: @attachment, member: other_member)
            create(:comment, subject: @post, attachment: @attachment, member: @member)

            sign_in(@member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["comments_count"]
          end

          test "public post attachment can be fetched without signing in" do
            @post.update!(visibility: :public)

            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "non-public post attachment cannot be fetched without signing in" do
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end
        end
      end

      context "#notes" do
        before do
          @note = create(:note)
          @member = @note.member
          @org = @member.organization
          @attachment = create(:attachment, subject: @note)
          @project = create(:project, organization: @org)
        end

        context "#show" do
          test "author can show attachment" do
            sign_in(@member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "non author cannot show attachment" do
            other_member = create(:organization_membership, :member, organization: @org)
            sign_in(other_member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end

          test "viewer permission can show attachment" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "editor permission can show attachment" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "project viewer can show attachment" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "project editor can show attachment" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "member not part of private project cannot show attachment" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end

          test "non org member cannot show attachment" do
            other_member = create(:organization_membership, :member)
            sign_in(other_member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end

          test "includes commenters" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:comment, subject: @note, attachment: @attachment, member: @member)
            create(:comment, subject: @note, attachment: @attachment, member: other_member)
            create(:comment, subject: @note, attachment: @attachment, member: @member)

            sign_in(@member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["comments_count"]
          end

          test "public note attachment can be fetched without signing in" do
            @note.update!(visibility: :public)

            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "public note attachment in 2FA-enforced org can be fetched by non-org member" do
            other_member = create(:organization_membership, :member)
            @note.update!(visibility: :public)
            @org.update_setting(:enforce_two_factor_authentication, true)

            sign_in(other_member.user)
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal @attachment.public_id, json_response["id"]
          end

          test "non-public note attachment cannot be fetched without signing in" do
            get organization_attachment_path(@org.slug, @attachment.public_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
