class CreateCallRecordingSpeakers < ActiveRecord::Migration[7.1]
  def change
    create_table :call_recording_speakers, id: { type: :bigint, unsigned: true } do |t|
      t.string :name, null: false
      t.references :call_recording, null: false, unsigned: true
      t.references :organization_membership, null: false, unsigned: true

      t.timestamps
    end

    add_index :call_recording_speakers, [:call_recording_id, :organization_membership_id], unique: true
    add_index :call_recording_speakers, [:call_recording_id, :name], unique: true
  end
end
