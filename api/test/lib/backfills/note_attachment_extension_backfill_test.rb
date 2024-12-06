# frozen_string_literal: true

require "test_helper"

module Backfills
  class NoteAttachmentExtensionBackfillTest < ActiveSupport::TestCase
    include ActionView::Helpers::AssetTagHelper

    describe ".run" do
      it "creates attachments and updates html" do
        html = <<~HTML.strip
          <p>coolio</p>
          <p><note-attachment type="image/jpeg" path="foo/bar.jpeg" width=1920 height=1080 /></p>
          <p><note-attachment type="video/mp4" path="cat/dog.mp4" width=320 height=480 duration=2400 cover_path="cat/dog.png" /></p>
        HTML

        note = create(
          :note,
          description_html: html,
        )

        assert_equal 0, note.attachments.count

        assert_difference -> { note.attachments.count }, 2 do
          NoteAttachmentExtensionBackfill.run(dry_run: false)
        end

        note.reload

        expected_html = <<~HTML.strip
          <p>coolio</p>
          <p><post-attachment id="#{note.attachments[0].public_id}" file_type="image/jpeg" width="1920" height="1080"></post-attachment></p>
          <p><post-attachment id="#{note.attachments[1].public_id}" file_type="video/mp4" width="320" height="480"></post-attachment></p>
        HTML

        assert_equal 2, note.attachments.count
        assert_equal expected_html, note.description_html
        assert_not note.description_state
      end

      it "doesnt change latest attachment extension" do
        html = <<~HTML.strip
          <p>coolio</p>
          <p><post-attachment file_type="image/jpeg" id="abcd" width=1920 height=1080 /></p>
          <p><post-attachment file_type="video/mp4" id="1234" width=320 height=480 /></p>
        HTML

        note = create(
          :note,
          description_html: html,
        )

        assert_difference -> { note.attachments.count }, 0 do
          NoteAttachmentExtensionBackfill.run(dry_run: false)
        end

        note.reload

        assert_equal html, note.description_html
      end

      it "only updates org notes when provided" do
        html = <<~HTML.strip
          <p>coolio</p>
          <p><note-attachment type="image/jpeg" path="foo/bar.jpeg" width=1920 height=1080 /></p>
          <p><note-attachment type="video/mp4" path="cat/dog.mp4" width=320 height=480 duration=2400 cover_path="cat/dog.png" /></p>
        HTML

        note1 = create(
          :note,
          description_html: html,
          member: create(:organization_membership, organization: create(:organization, slug: "foo")),
        )
        note2 = create(
          :note,
          description_html: html,
          member: create(:organization_membership, organization: create(:organization, slug: "bar")),
        )

        NoteAttachmentExtensionBackfill.run(dry_run: false, org_slug: "foo")

        note1.reload
        note2.reload

        assert_equal 2, note1.attachments.count
        assert_equal 0, note2.attachments.count
        assert_not_equal html, note1.description_html
        assert_equal html, note2.description_html
      end

      it "dry run doesn't change anything" do
        html = <<~HTML.strip
          <p>coolio</p>
          <p><note-attachment type="image/jpeg" path="foo/bar.jpeg" width=1920 height=1080 /></p>
          <p><note-attachment type="video/mp4" path="cat/dog.mp4" width=320 height=480 duration=2400 cover_path="cat/dog.png" /></p>
        HTML

        note = create(
          :note,
          description_html: html,
        )

        assert_difference -> { note.attachments.count }, 0 do
          NoteAttachmentExtensionBackfill.run(dry_run: true)
        end

        note.reload

        assert_equal 0, note.attachments.count
        assert_equal html, note.description_html
      end

      it "removes malformed attachments" do
        html = <<~HTML.strip
          <p>coolio</p>
          <p><note-attachment type="image/jpeg" width=1920 height=1080 /></p>
          <p><note-attachment path type="image/jpeg" width=1920 height=1080 /></p>
          <p><note-attachment path="" type="image/jpeg" width=1920 height=1080 /></p>
        HTML

        note = create(
          :note,
          description_html: html,
        )

        NoteAttachmentExtensionBackfill.run(dry_run: false)

        note.reload

        expected_html = <<~HTML.strip
          <p>coolio</p>
        HTML

        assert_equal 0, note.attachments.count
        assert_not_equal expected_html, note.description_html
      end
    end
  end
end
