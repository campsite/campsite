class AddArchivedAtToNotifications < ActiveRecord::Migration[7.2]
  def change
    add_column :notifications, :archived_at, :datetime
    add_index :notifications, :archived_at
  end
end
