class AddSkipNotificationsToEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :events, :skip_notifications, :boolean, null: false, default: false
  end
end
