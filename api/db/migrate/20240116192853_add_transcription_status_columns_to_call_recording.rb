class AddTranscriptionStatusColumnsToCallRecording < ActiveRecord::Migration[7.1]
  def change
    add_column :call_recordings, :transcription_succeeded_at, :datetime
    add_column :call_recordings, :transcription_failed_at, :datetime
  end
end
