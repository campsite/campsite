# frozen_string_literal: true

require "test_helper"

class UpdateCoToComLinksJobTest < ActiveJob::TestCase
  INPUT_HTML = <<~HTML.strip
    <a href="https://app.campsite.co/foo-bar/123">Link 1</a>
    <a href="https://app.campsite.com/cat/abc">Link 2</a>
    <a href="https://google.com/noop">Link 3</a>
  HTML

  OUTPUT_HTML = <<~HTML.strip
    <a href="https://app.campsite.com/foo-bar/123">Link 1</a>
    <a href="https://app.campsite.com/cat/abc">Link 2</a>
    <a href="https://google.com/noop">Link 3</a>
  HTML

  context "perform" do
    test "it updates post links" do
      post = create(:post, description_html: INPUT_HTML)

      UpdateCoToComLinkJob.new.perform(post.id, "Post")

      prev_updated_at = post.updated_at
      post.reload
      assert_equal OUTPUT_HTML, post.description_html
      assert_equal prev_updated_at, post.updated_at
    end

    test "it updates comment links" do
      comment = create(:comment, body_html: INPUT_HTML)

      UpdateCoToComLinkJob.new.perform(comment.id, "Comment")

      prev_updated_at = comment.updated_at
      comment.reload
      assert_equal OUTPUT_HTML, comment.body_html
      assert_equal prev_updated_at, comment.updated_at
    end

    test "it updates note links" do
      note = create(:note, description_html: INPUT_HTML)

      UpdateCoToComLinkJob.new.perform(note.id, "Note")

      prev_updated_at = note.updated_at
      note.reload
      assert_equal OUTPUT_HTML, note.description_html
      assert_equal prev_updated_at, note.updated_at
    end
  end
end
