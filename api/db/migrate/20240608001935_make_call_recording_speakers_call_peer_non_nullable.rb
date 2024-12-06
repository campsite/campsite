class MakeCallRecordingSpeakersCallPeerNonNullable < ActiveRecord::Migration[7.1]
  def up
    Backfills::CallRecordingSpeakersCallPeerBackfill.run(dry_run: false) if Rails.env.development? && !ENV['ENABLE_PSDB']
    change_column :call_recording_speakers, :call_peer_id, :bigint, unsigned: true, null: false
  end

  def down
    change_column :call_recording_speakers, :call_peer_id, :bigint, unsigned: true, null: true
  end
end
