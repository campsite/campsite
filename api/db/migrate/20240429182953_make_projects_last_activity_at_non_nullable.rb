class MakeProjectsLastActivityAtNonNullable < ActiveRecord::Migration[7.1]
  def up
    Backfills::ProjectLastActivityAtBackfill.run(dry_run: false) if Rails.env.development? && !ENV['ENABLE_PSDB']
    change_column :projects, :last_activity_at, :datetime, null: false
  end

  def down
    change_column :projects, :last_activity_at, :datetime
  end
end
