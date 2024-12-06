class CreateCallRecordings < ActiveRecord::Migration[7.1]
  def change
    create_table :call_recordings, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.datetime :started_at, null: false
      t.datetime :stopped_at
      t.datetime :transcription_started_at
      t.string :remote_beam_id, null: false
      t.string :remote_job_id, null: false
      t.string :remote_recording_id
      t.string :remote_transcription_id
      t.text :file_path
      t.text :summary_json_file_path
      t.text :transcript_json_file_path
      t.text :transcript_srt_file_path
      t.text :transcript_txt_file_path
      t.integer :size
      t.integer :max_width
      t.integer :max_height
      t.references :call, null: false, type: :bigint, unsigned: true

      t.timestamps
    end
    add_index :call_recordings, :remote_beam_id
    add_index :call_recordings, :remote_job_id
    add_index :call_recordings, :remote_recording_id
    add_index :call_recordings, :remote_transcription_id
  end
end
