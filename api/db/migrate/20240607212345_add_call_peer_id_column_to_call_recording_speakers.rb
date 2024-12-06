class AddCallPeerIdColumnToCallRecordingSpeakers < ActiveRecord::Migration[7.1]
  def up
    add_column :call_recording_speakers, :call_peer_id, :bigint, unsigned: true, null: true
    add_index :call_recording_speakers, :call_peer_id
    change_column :call_recording_speakers, :organization_membership_id, :bigint, unsigned: true, null: true
  end

  def down
    remove_column :call_recording_speakers, :call_peer_id, :bigint, unsigned: true, null: true
    change_column :call_recording_speakers, :organization_membership_id, :bigint, unsigned: true, null: false
  end
end
