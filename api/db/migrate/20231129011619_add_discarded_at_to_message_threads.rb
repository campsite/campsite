class AddDiscardedAtToMessageThreads < ActiveRecord::Migration[7.1]
  def change
    add_column :message_threads, :discarded_at, :datetime
    add_index :message_threads, :discarded_at
  end
end
