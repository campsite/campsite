class MakeTranscriptColumnsMediumText < ActiveRecord::Migration[7.1]
  def up
    change_column :attachments, :transcription_vtt, :mediumtext
    change_column :call_recordings, :transcription_vtt, :mediumtext 
  end

  def down
    change_column :attachments, :transcription_vtt, :text
    change_column :call_recordings, :transcription_vtt, :text
  end
end
