# frozen_string_literal: true

require "streamio-ffmpeg"

module Backfills
  class AttachmentVideoDimensionsBackfill
    def self.run(dry_run: true)
      video_attachments = Attachment.where(file_type: "video/mp4", width: nil, height: nil)
      video_attachments_count = video_attachments.count

      video_attachments.each do |attachment|
        movie = FFMPEG::Movie.new(attachment.url)

        width = movie.width
        height = movie.height

        Rails.logger.debug { "URL: #{attachment.url}, Width: #{width}px, Height: #{height}px" }

        attachment.update!(width: width, height: height) unless dry_run
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{video_attachments_count} Attachment #{"record".pluralize(video_attachments_count)}"
    end
  end
end
