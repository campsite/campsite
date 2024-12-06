# frozen_string_literal: true

class AddFiltersToPostDigest < ActiveRecord::Migration[7.0]
  def change
    add_column(:post_digests, :filter_tag_ids, :text, array: true)
    add_column(:post_digests, :filter_project_ids, :text, array: true)
    add_column(:post_digests, :filter_member_ids, :text, array: true)
    add_column(:post_digests, :exclude_post_ids, :text, array: true)
    add_column(:post_digests, :filter_from, :string)
    add_column(:post_digests, :filter_to, :string)
    remove_column(:post_digests, :posts_count, :integer)
  end
end
