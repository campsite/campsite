# frozen_string_literal: true

class AddPostsCountToPostDigests < ActiveRecord::Migration[7.0]
  def change
    add_column(:post_digests, :posts_count, :integer, null: false, default: 0)
    change_column(:post_digests, :description, :text)
  end
end
