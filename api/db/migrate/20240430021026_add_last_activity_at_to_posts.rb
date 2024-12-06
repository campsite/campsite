class AddLastActivityAtToPosts < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :last_activity_at, :datetime
    add_index :posts, :last_activity_at
  end
end
