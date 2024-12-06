class AddPublicIdToTimelineEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :timeline_events, :public_id, :string, limit: 12
    add_index :timeline_events, :public_id, unique: true
  end
end
