# frozen_string_literal: true

module Backfills
  class RemoteUserAvatarBackfill
    def self.run(dry_run: true, organization_id: nil)
      users = User.where("avatar_path LIKE ?", "https://%")
      users = users.joins(:organization_memberships).where(organization_memberships: { organization_id: organization_id }) if organization_id
      users_count = users.count

      users.find_each do |user|
        ImportRemoteUserAvatarJob.perform_async(user.id) unless dry_run
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{users_count} Users #{"record".pluralize(users_count)}"
    end
  end
end
