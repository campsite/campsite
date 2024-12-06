class AddUniqueIndexToPostReactions < ActiveRecord::Migration[7.0]
  def change
    add_index :post_reactions, [:user_id, :post_id, :content], unique: true
  end
end
