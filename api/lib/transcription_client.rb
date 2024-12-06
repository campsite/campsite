# frozen_string_literal: true

class TranscriptionClient
  attr_reader :attachment

  def initialize(attachment)
    @attachment = attachment
  end

  def start
    # The job name cannot have dashes in it, so we replace them with underscores
    params = {
      transcription_job_name: job_name,
      language_code: "en-US",
      subtitles: {
        formats: ["vtt", "srt"],
      },
      media: {
        media_file_uri: "s3://#{source_media_bucket}/" + attachment.file_path,
      },
      output_bucket_name: output_bucket,
      output_key: "#{base_folder}/",
    }
    transcriber_client.start_transcription_job(params)
  end

  def status
    return @status if @status

    job = transcriber_client.get_transcription_job({
      transcription_job_name: attachment.transcription_job_id,
    })
    @status = job.transcription_job.transcription_job_status
  rescue Aws::TranscribeService::Errors::BadRequestException
    @status = "FAILED"
  end

  def vtt
    return @vtt if @vtt

    begin
      resp = s3_client.get_object({
        bucket: output_bucket,
        key: "#{base_folder}/#{job_name}.vtt",
      })
      @vtt = resp.body.read
    rescue Aws::S3::Errors::NoSuchKey
      @vtt = nil
    end
  end

  private

  def job_name
    base_filename.gsub(/-/i, "_")
  end

  def base_filename
    attachment.file_path.split("/").last.split(".").first
  end

  def base_folder
    attachment.file_path.split("/").slice(0..-2).join("/")
  end

  def source_media_bucket
    Rails.application.credentials&.dig(:aws_transcriber, :source_media_bucket) || ""
  end

  def output_bucket
    Rails.application.credentials&.dig(:aws_transcriber, :output_bucket) || ""
  end

  def s3_client
    @s3_client ||= Aws::S3::Client.new(
      region: "us-east-1",
      credentials: Aws::Credentials.new(
        Rails.application.credentials&.dig(:aws_transcriber, :access_key_id),
        Rails.application.credentials&.dig(:aws_transcriber, :secret_access_key),
      ),
    )
  end

  def transcriber_client
    @transcriber_client ||= Aws::TranscribeService::Client.new(
      region: "us-east-1",
      credentials: Aws::Credentials.new(
        Rails.application.credentials&.dig(:aws_transcriber, :access_key_id),
        Rails.application.credentials&.dig(:aws_transcriber, :secret_access_key),
      ),
    )
  end
end
