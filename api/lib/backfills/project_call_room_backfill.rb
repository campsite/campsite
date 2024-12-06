# frozen_string_literal: true

module Backfills
  class ProjectCallRoomBackfill
    def self.run(dry_run: true)
      projects = Project.where.missing(:call_room)

      count = 0
      projects.find_each.with_index do |project, index|
        CreateProjectCallRoomJob.perform_in(index + 1, project.id) unless dry_run
        count += 1
      end

      "#{dry_run ? "Would have enqueued" : "Enqueued"} #{count} #{"CreateProjectCallRoomJob".pluralize(count)}"
    end
  end
end
