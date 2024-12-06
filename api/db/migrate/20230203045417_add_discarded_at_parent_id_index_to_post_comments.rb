class AddDiscardedAtParentIdIndexToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_index :post_comments, [:parent_id, :discarded_at]
  end
end
