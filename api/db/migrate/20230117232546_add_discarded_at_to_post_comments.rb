class AddDiscardedAtToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :discarded_at, :datetime
    add_index :post_comments, :discarded_at
  end
end
