# frozen_string_literal: true

module Backfills
  class DupeViewsBackfill
    def self.run(dry_run: true)
      removed_views_count = 0

      dupe_views = PostView.select(:post_id, :organization_membership_id).group(:post_id, :organization_membership_id).having("count(1) > 1")
      dupe_views.each do |dupe_view|
        views = PostView.where(post_id: dupe_view.post_id, organization_membership_id: dupe_view.organization_membership_id).order(created_at: :desc)
        # remove all views but the first one
        views[1..-1].each { |view| view.destroy! unless dry_run }
        removed_views_count += 1
      end

      "#{dry_run ? "Would have destroyed" : "Destroyed"} #{removed_views_count}"
    end
  end
end
