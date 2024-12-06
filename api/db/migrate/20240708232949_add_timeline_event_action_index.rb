class AddTimelineEventActionIndex < ActiveRecord::Migration[7.1]
  def change
    add_index :timeline_events, :action
  end
end
