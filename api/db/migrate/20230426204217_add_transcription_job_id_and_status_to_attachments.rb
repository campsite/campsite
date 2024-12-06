class AddTranscriptionJobIdAndStatusToAttachments < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :transcription_job_id, :string
    add_column :attachments, :transcription_job_status, :string
    add_column :attachments, :transcription_vtt, :text

    add_index :attachments, :transcription_job_status
  end
end
