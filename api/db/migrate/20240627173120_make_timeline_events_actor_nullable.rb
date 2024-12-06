class MakeTimelineEventsActorNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :timeline_events, :actor_id, :bigint, unsigned: true, null: true
    change_column :timeline_events, :actor_type, :string, null: true
  end

  def down
    change_column :timeline_events, :actor_id, :bigint, unsigned: true, null: false
    change_column :timeline_events, :actor_type, :string, null: false
  end
end
