# frozen_string_literal: true

require "test_helper"

class ImportRemoteUserAvatarJobTest < ActiveJob::TestCase
  describe "#perform" do
    test "downloads remote avatar, uploads to S3, and updates user avatar_path" do
      Down.expects(:download).returns(stub(content_type: "image/jpeg"))
      S3_BUCKET.expects(:object).returns(stub(put: true))

      remote_avatar_url = "https://lh3.googleusercontent.com/a/ALm5wu0DWUk4MeNAK0ZrWgQCO2Fs6sWBPyvYwse8mAK0FA=s96-c"
      user = create(:user, avatar_path: remote_avatar_url)

      ImportRemoteUserAvatarJob.new.perform(user.id)

      assert_match %r{u/#{user.public_id}/a/.*\.jpg}, user.reload.avatar_path
    end

    test "no-op for non-remote avatar" do
      Down.expects(:download).never
      S3_BUCKET.expects(:object).never

      avatar_path = "u/123/a/abc.jpg"
      user = create(:user, avatar_path: avatar_path)

      ImportRemoteUserAvatarJob.new.perform(user.id)

      assert_equal avatar_path, user.reload.avatar_path
    end
  end
end
