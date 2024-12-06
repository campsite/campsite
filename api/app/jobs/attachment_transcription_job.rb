# frozen_string_literal: true

class AttachmentTranscriptionJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(attachment_id)
    attachment = Attachment.find(attachment_id)
    return if attachment.transcription_job_id

    client = TranscriptionClient.new(attachment)
    job = client.start
    attachment.transcription_job_id = job.transcription_job.transcription_job_name
    attachment.transcription_job_status = job.transcription_job.transcription_job_status
    attachment.save!
  rescue Aws::TranscribeService::Errors::ConflictException
    # no-op, it is likely two jobs were enqueued at the same time
  end
end
