# frozen_string_literal: true

module Backfills
  class OrganizationMembershipLastSeenAtBackfill
    def self.run(dry_run: true)
      members = OrganizationMembership.joins(:post_views).where(last_seen_at: nil).distinct

      members.find_each do |member|
        post_view = member.post_views.order(created_at: :desc).first

        member.update_column(:last_seen_at, post_view.created_at) unless dry_run
      end

      "#{dry_run ? "Would have updated" : "updated"} #{members.count} OrganizationMembership #{"record".pluralize(members.count)}"
    end
  end
end
