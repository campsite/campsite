# frozen_string_literal: true

require "test_helper"

module Backfills
  class GeneralProjectsBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "updates general projects" do
        project = create(:project, :general, is_default: false)
        GeneralProjectsBackfill.run(dry_run: false)

        assert project.reload.is_default
      end

      it "doesn't updates normal projects" do
        project = create(:project, is_default: false)
        GeneralProjectsBackfill.run(dry_run: false)

        assert_not project.reload.is_default
      end

      it "skips updating general projects during dry run" do
        project = create(:project, :general, is_default: false)
        GeneralProjectsBackfill.run(dry_run: true)

        assert_not project.reload.is_default
      end
    end
  end
end
