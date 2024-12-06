class MakeCallRoomsPublicIdNonNullable < ActiveRecord::Migration[7.1]
  def up
    Backfills::CallRoomsPublicIdBackfill.run(dry_run: false) if Rails.env.development? && !ENV['ENABLE_PSDB']
    change_column :call_rooms, :public_id, :string, limit: 12, null: false
  end

  def down
    change_column :call_rooms, :public_id, :string, limit: 12
  end
end
