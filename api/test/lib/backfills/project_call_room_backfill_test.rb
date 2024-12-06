# frozen_string_literal: true

require "test_helper"

module Backfills
  class ProjectCallRoomBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      before do
        @project_without_call_room = create(:project, call_room: nil)
        @project_with_call_room = create(:project)
      end

      it "enqueues CreateProjectHmsCallRoomJobs for projects missing them" do
        ProjectCallRoomBackfill.run(dry_run: false)

        assert_enqueued_sidekiq_jobs(1, only: CreateProjectCallRoomJob)
        assert_enqueued_sidekiq_job(CreateProjectCallRoomJob, args: [@project_without_call_room.id], in: 1)
      end

      it "does nothing for dry run" do
        ProjectCallRoomBackfill.run

        assert_enqueued_sidekiq_jobs(0, only: CreateProjectCallRoomJob)
      end
    end
  end
end
