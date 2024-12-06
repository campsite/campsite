# frozen_string_literal: true

class AttachmentDimensionsJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(attachment_id)
    attachment = Attachment.find(attachment_id)

    if attachment.image?
      return if attachment.height && attachment.width

      width, height = FastImage.size(attachment.url, raise_on_failure: true, timeout: 60)
      attachment.width = width
      attachment.height = height
      attachment.save!
    end

    if attachment.video?
      return if attachment.height && attachment.width && attachment.duration

      movie = FFMPEG::Movie.new(attachment.url)
      attachment.update!(width: movie.width, height: movie.height, duration: movie.duration.to_i)
    end
  end
end
