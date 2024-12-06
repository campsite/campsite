# frozen_string_literal: true

module Backfills
  class PostViewsReadAtBackfill
    def self.run(dry_run: true)
      updated_views = PostView.count

      unless dry_run
        PostView.in_batches.update_all("read_at = updated_at")
      end

      "#{dry_run ? "Would have updated" : "updated"} #{updated_views} views"
    end
  end
end
