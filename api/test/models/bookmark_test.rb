# frozen_string_literal: true

require "test_helper"

class BookmarkTest < ActiveSupport::TestCase
  context "#before_create" do
    test "increments the position if bookmarkable has existing bookmarks" do
      bookmark = create(:bookmark)
      assert_equal 0, bookmark.position

      another = create(:bookmark, bookmarkable: bookmark.bookmarkable)
      assert_equal 1, another.position

      another = create(:bookmark, bookmarkable: bookmark.bookmarkable)
      assert_equal 2, another.position
    end
  end

  context "after_destroy_commit" do
    test "updates the position for bookmark siblings" do
      project = create(:project)
      first = create(:bookmark, bookmarkable: project)
      second = create(:bookmark, bookmarkable: project)
      third = create(:bookmark, bookmarkable: project)
      fourth = create(:bookmark, bookmarkable: project)

      assert_equal 0, first.position
      assert_equal 1, second.position
      assert_equal 2, third.position
      assert_equal 3, fourth.position

      second.destroy!

      assert_equal 0, first.reload.position
      assert_equal 1, third.reload.position
      assert_equal 2, fourth.reload.position
    end
  end
end
