# frozen_string_literal: true

require "test_helper"

class Comment
  class CreateCommentTest < ActiveSupport::TestCase
    setup do
      @org = create(:organization)
      @user = create(:user)
      @member = create(:organization_membership, organization: @org, user: @user)
      @post = create(:post, organization: @org)
    end

    test "creates event with skip_notifications param if specified" do
      comment = Comment::CreateComment.new(
        member: @member,
        subject: @post,
        parent: nil,
        params: {
          body_html: "<p>this is a description</p>",
        },
        skip_notifications: true,
      ).run

      assert_predicate comment.events.first, :skip_notifications?
    end

    test "creates a comment by an integration" do
      integration = create(:integration, :slack, owner: @org)

      comment = Comment::CreateComment.new(
        subject: @post,
        parent: nil,
        integration: integration,
        params: {
          body_html: "<p>this is a description</p>",
        },
      ).run

      assert_equal @post.comments.first, comment
      assert_equal comment.author.display_name, "Slack"
    end

    test "creates a comment reply by an integration" do
      integration = create(:integration, :slack, owner: @org)
      parent = create(:comment, subject: @post)

      comment = Comment::CreateComment.new(
        subject: @post,
        parent: parent,
        integration: integration,
        params: {
          body_html: "<p>this is a description</p>",
        },
      ).run

      assert_equal parent.replies.first, comment
      assert_equal comment.author.display_name, "Slack"
    end

    test "creates a comment with attachment objects" do
      attachments = create_list(:attachment, 2, subject: nil)

      attachment_params = attachments.map do |attachment|
        {
          file_path: attachment[:file_path],
          file_type: attachment[:file_type],
          duration: attachment[:duration],
          preview_file_path: attachment[:preview_file_path],
          width: attachment[:width],
          height: attachment[:height],
          name: attachment[:name],
          size: attachment[:size],
        }
      end

      comment = Comment::CreateComment.new(
        subject: @post,
        parent: nil,
        params: {
          body_html: "<p>this is a description</p>",
          attachments: attachment_params,
        },
      ).run

      assert_equal comment.attachments.count, 2
      assert_equal comment.attachments.pluck(:subject_id), [comment.id] * 2
    end

    test "creates a comment with attachment_ids" do
      attachments = create_list(:attachment, 2, subject: nil)

      comment = Comment::CreateComment.new(
        subject: @post,
        parent: nil,
        params: {
          body_html: "<p>this is a description</p>",
          attachment_ids: attachments.map(&:public_id),
        },
      ).run

      assert_equal comment.attachments.count, 2
      assert_equal comment.attachments.pluck(:subject_id), [comment.id] * 2
    end
  end
end
