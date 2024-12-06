# frozen_string_literal: true

require "test_helper"

module Backfills
  class RemoveProjectRemindersBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "destroys ScheduledNotification records for projects" do
        project_scheduled_notification = create(:scheduled_notification, schedulable: create(:project))
        user_scheduled_notification = create(:scheduled_notification, schedulable: create(:user))

        RemoveProjectRemindersBackfill.run(dry_run: false)

        assert_not ScheduledNotification.exists?(id: project_scheduled_notification.id)
        assert ScheduledNotification.exists?(id: user_scheduled_notification.id)
      end

      it "dry run is a no-op" do
        project_scheduled_notification = create(:scheduled_notification, schedulable: create(:project))
        user_scheduled_notification = create(:scheduled_notification, schedulable: create(:user))

        RemoveProjectRemindersBackfill.run

        assert ScheduledNotification.exists?(id: project_scheduled_notification.id)
        assert ScheduledNotification.exists?(id: user_scheduled_notification.id)
      end
    end
  end
end
