class AddManuallyMarkedUnreadAtToProjectViews < ActiveRecord::Migration[7.2]
  def change
    add_column :project_views, :manually_marked_unread_at, :datetime
    add_index :project_views, :manually_marked_unread_at
  end
end
