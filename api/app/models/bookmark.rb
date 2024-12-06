# frozen_string_literal: true

class Bookmark < ApplicationRecord
  include PublicIdGenerator

  belongs_to :bookmarkable, polymorphic: true

  validates :title,
    length: {
      maximum: 255,
      too_long: "should be less than 255 characters.",
    },
    presence: true

  before_create :set_position
  after_destroy_commit :reorder_siblings_after_destroy

  private

  def set_position
    max_position = bookmarkable.bookmarks.maximum(:position)
    self.position = max_position.nil? ? 0 : max_position + 1
  end

  def reorder_siblings_after_destroy
    bookmarkable.with_lock do
      bookmarks = bookmarkable.bookmarks.where("position > ?", position)
      bookmarks.each do |bookmark|
        bookmark.update(position: bookmark.position - 1)
      end
    end
  end
end
