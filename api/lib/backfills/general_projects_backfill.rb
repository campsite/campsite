# frozen_string_literal: true

module Backfills
  class GeneralProjectsBackfill
    def self.run(dry_run: true)
      updated_projects = dry_run ? Project.where(is_general: true).count : Project.where(is_general: true).update_all(is_default: true)

      "#{dry_run ? "Would have updated" : "Updated"} #{updated_projects} general #{"projects".pluralize(updated_projects)}"
    end
  end
end
