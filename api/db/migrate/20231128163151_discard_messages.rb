class DiscardMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :discarded_at, :datetime
    add_index :messages, :discarded_at
  end
end
