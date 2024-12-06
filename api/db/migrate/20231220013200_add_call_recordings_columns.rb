class AddCallRecordingsColumns < ActiveRecord::Migration[7.1]
  def change
    add_column :call_recordings, :summary_json, :json
    add_column :call_recordings, :transcription_vtt, :text
  end
end
