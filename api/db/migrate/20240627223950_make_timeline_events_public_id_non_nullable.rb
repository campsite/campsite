class MakeTimelineEventsPublicIdNonNullable < ActiveRecord::Migration[7.1]
  def up
    Backfills::TimelineEventsPublicIdBackfill.run(dry_run: false) if Rails.env.development? && !ENV['ENABLE_PSDB']
    change_column :timeline_events, :public_id, :string, limit: 12, null: false
  end

  def down
    change_column :timeline_events, :public_id, :string, limit: 12
  end
end
