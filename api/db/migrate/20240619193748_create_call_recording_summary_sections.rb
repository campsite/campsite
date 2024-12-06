class CreateCallRecordingSummarySections < ActiveRecord::Migration[7.1]
  def change
    create_table :call_recording_summary_sections, id: { type: :bigint, unsigned: true } do |t|
      t.references :call_recording, null: false, unsigned: true, index: true
      t.integer :status, null: false, index: true
      t.integer :section, null: false
      t.mediumtext :prompt, null: false
      t.mediumtext :response
      t.timestamps
    end
  end
end
