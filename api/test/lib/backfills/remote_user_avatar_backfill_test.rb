# frozen_string_literal: true

require "test_helper"

module Backfills
  class RemoteUserAvatarBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      test "enqueues ImportRemoteUserAvatarJob for user with remote avatar" do
        user = create(:user, avatar_path: "https://lh3.googleusercontent.com/a/ALm5wu0DWUk4MeNAK0ZrWgQCO2Fs6sWBPyvYwse8mAK0FA=s96-c")

        RemoteUserAvatarBackfill.run(dry_run: false)

        assert_enqueued_sidekiq_job(ImportRemoteUserAvatarJob, args: [user.id])
      end

      test "does not enqueue ImportRemoteUserAvatarJob for user without remote avatar" do
        create(:user, avatar_path: "u/123/a/abc.jpg")

        RemoteUserAvatarBackfill.run(dry_run: false)

        refute_enqueued_sidekiq_job(ImportRemoteUserAvatarJob)
      end

      test "only enqueues job for users in organization if specified" do
        org_user = create(:user, avatar_path: "https://lh3.googleusercontent.com/a/ALm5wu0DWUk4MeNAK0ZrWgQCO2Fs6sWBPyvYwse8mAK0FA=s96-c")
        member = create(:organization_membership, user: org_user)
        non_org_user = create(:user, avatar_path: "https://lh3.googleusercontent.com/a/ALm5wu0DWUk4MeNAK0ZrWgQCO2Fs6sWBPyvYwse8mAK0FA=s96-c")

        RemoteUserAvatarBackfill.run(dry_run: false, organization_id: member.organization_id)

        assert_enqueued_sidekiq_job(ImportRemoteUserAvatarJob, args: [org_user.id])
        refute_enqueued_sidekiq_job(ImportRemoteUserAvatarJob, args: [non_org_user.id])
      end

      test "dry run is a no-op" do
        create(:user, avatar_path: "https://lh3.googleusercontent.com/a/ALm5wu0DWUk4MeNAK0ZrWgQCO2Fs6sWBPyvYwse8mAK0FA=s96-c")

        RemoteUserAvatarBackfill.run

        refute_enqueued_sidekiq_job(ImportRemoteUserAvatarJob)
      end
    end
  end
end
