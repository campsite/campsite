class ReplaceDeletedAtWithDiscardedAtOnNotifications < ActiveRecord::Migration[7.0]
  def change
    remove_column :notifications, :deleted_at, :datetime
    add_column :notifications, :discarded_at, :datetime
    add_index :notifications, :discarded_at
  end
end
