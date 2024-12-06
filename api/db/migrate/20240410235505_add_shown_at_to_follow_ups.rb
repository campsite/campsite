class AddShownAtToFollowUps < ActiveRecord::Migration[7.1]
  def change
    add_column :follow_ups, :shown_at, :datetime
    add_index :follow_ups, :shown_at
  end
end
