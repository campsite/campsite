# frozen_string_literal: true

class CallRecording < ApplicationRecord
  TRANSCRIPTION_STATUSES = [
    NOT_STARTED_TRANSCRIPTION_STATUS = "NOT_STARTED",
    IN_PROGRESS_TRANSCRIPTION_STATUS = "IN_PROGRESS",
    COMPLETED_TRANSCRIPTION_STATUS = "COMPLETED",
    FAILED_TRANSCRIPTION_STATUS = "FAILED",
  ]

  include PublicIdGenerator
  include ImgixUrlBuilder

  belongs_to :call
  has_many :speakers, class_name: "CallRecordingSpeaker", dependent: :destroy_async
  has_many :summary_sections, class_name: "CallRecordingSummarySection", dependent: :destroy_async
  has_many :chat_links, class_name: "CallRecordingChatLink", dependent: :destroy_async

  after_commit :call_reindex, if: -> { call && Searchkick.callbacks? }

  delegate :reindex, to: :call, prefix: true

  def url
    return unless file_path

    build_imgix_url(file_path)
  end

  def chat_url
    return unless chat_file_path

    build_imgix_url(chat_file_path)
  end

  def imgix_video_thumbnail_preview_url
    return unless file_path

    ImgixVideoThumbnailUrls.new(file_path: file_path).preview_url
  end

  def name
    return unless file_path

    File.basename(file_path)
  end

  def extension
    File.extname(file_path).downcase
  end

  def file_type
    return unless file_path

    Rack::Mime::MIME_TYPES[extension]
  end

  def formatted_transcript
    return if transcription_vtt.blank?

    transcription_vtt
      .gsub(/^WEBVTT/, "")
      .lines
      .reject { |line| line.match?(/\d|(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})/) || line.strip.empty? }
      .join
      .strip
  end

  def speaker_display_name_to_member
    speakers.map { |speaker| [speaker.name, speaker.call_peer.organization_membership] }.to_h
  end

  def summary_html
    return unless summary_sections.any?

    sections_map = summary_sections.index_by(&:section)
    ordered_sections = [sections_map["summary"], sections_map["agenda"], sections_map["next_steps"]].compact

    section_htmls = ordered_sections.map do |section|
      h2 = case section.section
      when "summary"
        nil
      when "agenda"
        nil
      when "next_steps"
        "<h2>Next steps</h2>"
      end

      [h2, section.response]
    end

    section_htmls.flatten.compact.join
  end

  def transcript_srt_url
    return unless transcript_srt_file_path

    build_imgix_url(transcript_srt_file_path)
  end

  def transcription_status
    if transcription_succeeded_at
      COMPLETED_TRANSCRIPTION_STATUS
    elsif transcription_failed_at
      FAILED_TRANSCRIPTION_STATUS
    elsif transcription_started_at
      IN_PROGRESS_TRANSCRIPTION_STATUS
    else
      NOT_STARTED_TRANSCRIPTION_STATUS
    end
  end

  def processing?
    transcription_status == IN_PROGRESS_TRANSCRIPTION_STATUS
  end

  def create_speakers_from_transcription_vtt!
    return if transcription_vtt.blank?

    caption_text_lines = transcription_vtt.lines.select { |line| line.present? && !line.start_with?("WEBVTT") && !line.start_with?(/\d/) }
    speaker_names = caption_text_lines.map { |line| line.match(/^(.+):/)&.captures&.first }.compact.uniq
    peers = call.peers.eager_load(organization_membership: :user).to_a
    speaker_names.each do |speaker_name|
      peer = peers.find { |peer| peer.name == speaker_name }
      next unless peer

      speakers.create!(name: speaker_name, call_peer: peer)
    end
  end

  def duration_in_seconds
    if duration.present?
      duration
    elsif !stopped_at.nil?
      stopped_at - started_at
    else
      0
    end
  end

  def trigger_client_transcription_update
    return unless call.subject.respond_to?(:organization_memberships)

    call.subject.organization_memberships.eager_load(:organization, :user).each do |member|
      PusherTriggerJob.perform_async(
        member.user.channel_name,
        "call-recording-transcription-stale",
        { org_slug: member.organization.slug, call_recording_id: public_id }.to_json,
      )
    end
  end

  def trigger_stale
    PusherTriggerJob.perform_async(call.channel_name, "recording-stale", { call_recording_id: public_id }.to_json)
  end

  def create_pending_summary_sections!
    CallRecordingSummarySection.sections.keys.map do |section|
      summary_sections.create!(section: section)
    end
  end

  def generate_summary_sections(delay: nil)
    if formatted_transcript.blank?
      call.update!(generated_summary_status: :completed)
      return
    end

    create_pending_summary_sections!.each do |section|
      if delay
        GenerateCallRecordingSummarySectionJob.perform_in(delay.from_now, section.id)
      else
        GenerateCallRecordingSummarySectionJob.perform_async(section.id)
      end
    end
  end

  def export_file_name
    "#{public_id}#{extension}"
  end
end
