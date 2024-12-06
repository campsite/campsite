# frozen_string_literal: true

require "test_helper"

module Backfills
  class PostNoteRevertBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "sets the original_post_id when it has note features" do
        project = create(:project)
        note = create(
          :note,
          original_project_id: project.id,
          description_html: "<p>coolio</p><note-attachment />",
          member: create(:organization_membership, organization: project.organization),
        )
        post = create(:post, organization: project.organization, unfurled_link: note.url)

        assert_difference -> { Note.count }, 0 do
          PostNoteRevertBackfill.run(dry_run: false, org_slug: project.organization.slug)
        end

        assert Note.exists?(note.id)
        assert_equal post.id, note.reload.original_post_id
      end

      it "sets post content and destroys the note" do
        project = create(:project)
        note = create(
          :note,
          original_project_id: project.id,
          title: "Foo Bar",
          description_html: "<p>coolio</p>",
          member: create(:organization_membership, organization: project.organization),
        )
        post = create(:post, organization: project.organization, unfurled_link: note.url)

        assert_difference -> { Note.count }, -1 do
          PostNoteRevertBackfill.run(dry_run: false, org_slug: project.organization.slug)
        end

        assert_not Note.exists?(note.id)
        assert_equal "<p><strong>Foo Bar</strong></p><p>coolio</p>", post.reload.description_html
        assert_not post.unfurled_link
      end

      it "moves attachments to the post" do
        project = create(:project)
        note = create(
          :note,
          original_project_id: project.id,
          description_html: "<p>coolio</p>",
          member: create(:organization_membership, organization: project.organization),
        )
        post = create(:post, organization: project.organization, unfurled_link: note.url)
        attachments = create_list(:attachment, 3, subject: note)

        assert_difference -> { Note.count }, -1 do
          PostNoteRevertBackfill.run(dry_run: false, org_slug: project.organization.slug)
        end

        assert_not Note.exists?(note.id)
        assert_equal 3, post.reload.attachments.count
        assert attachments.all? { |attachment| attachment.reload.subject == post }
      end

      it "moves attachments to the post" do
        project = create(:project)
        note = create(
          :note,
          original_project_id: project.id,
          description_html: "<p>coolio</p>",
          member: create(:organization_membership, organization: project.organization),
        )
        post = create(:post, organization: project.organization, unfurled_link: note.url)
        comments = create_list(:comment, 3, subject: note)
        replies = create_list(:comment, 3, subject: note, parent: comments.first)

        assert_difference -> { Note.count }, -1 do
          PostNoteRevertBackfill.run(dry_run: false, org_slug: project.organization.slug)
        end

        assert_not Note.exists?(note.id)
        assert_equal 6, post.reload.comments.count
        assert comments.all? { |comment| comment.reload.subject == post }
        assert replies.all? { |comment| comment.reload.subject == post }
      end

      it "can handle empty descriptions" do
        project = create(:project)
        note = create(
          :note,
          original_project_id: project.id,
          title: "Foo Bar",
          description_html: nil,
          member: create(:organization_membership, organization: project.organization),
        )
        post = create(:post, organization: project.organization, unfurled_link: note.url)

        assert_difference -> { Note.count }, -1 do
          PostNoteRevertBackfill.run(dry_run: false, org_slug: project.organization.slug)
        end

        assert_not Note.exists?(note.id)
        assert_equal "<p><strong>Foo Bar</strong></p>", post.reload.description_html
        assert_not post.unfurled_link
      end
    end
  end
end
