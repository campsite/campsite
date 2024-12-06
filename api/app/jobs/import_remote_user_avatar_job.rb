# frozen_string_literal: true

class ImportRemoteUserAvatarJob < BaseJob
  sidekiq_options queue: "background"

  def perform(user_id)
    user = User.find(user_id)
    urls = AvatarUrls.new(avatar_path: user.avatar_path, display_name: user.display_name)
    return unless urls.remote?

    tempfile = Down.download(user.avatar_path, max_size: AvatarUrls::AVATAR_MAX_FILE_SIZE)
    key = user.generate_avatar_s3_key(tempfile.content_type)
    object = S3_BUCKET.object(key)
    object.put(body: tempfile)
    user.update!(avatar_path: key)
  end
end
