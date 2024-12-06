class MakePostsLastActivityAtNonNullable < ActiveRecord::Migration[7.1]
  def up
    Backfills::PostLastActivityAtBackfill.run(dry_run: false) if Rails.env.development? && !ENV['ENABLE_PSDB']
    change_column :posts, :last_activity_at, :datetime, null: false
  end

  def down
    change_column :posts, :last_activity_at, :datetime
  end
end
