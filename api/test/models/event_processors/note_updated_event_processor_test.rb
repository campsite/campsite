# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class NoteUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @note_author = create(:organization_membership, organization: @org)
        @note = create(:note, member: @note_author)
        @note.update!(last_activity_at: 1.day.ago, content_updated_at: 1.day.ago)
      end

      test "updates last_activity_at and content_updated_at timestamps" do
        # editing the certain fields, like description_html, should bump last_activity_at and content_updated_at
        Timecop.freeze do
          @note.update!(description_html: "<p>editing the text</p>")
          @note.events.updated_action.last!.process!

          assert_in_delta Time.current, @note.last_activity_at, 2.seconds
          assert_in_delta Time.current, @note.content_updated_at, 2.seconds
        end
        # fields not relavant to the user's directly editable content shouldn't change timestamps
        Timecop.freeze(1.day.from_now) do
          @note.update!(description_schema_version: 9)
          @note.events.updated_action.last!.process!

          assert_not_in_delta Time.current, @note.last_activity_at, 2.seconds
          assert_not_in_delta Time.current, @note.content_updated_at, 2.seconds
        end
      end

      test "destroys follow ups when project permission revoked and follow up owner doesn't have access" do
        note = create(:note)
        project = create(:project, organization: @org)
        note.add_to_project!(project: project)

        no_more_access_follow_up = create(:follow_up, subject: note)
        still_accessible_follow_up = create(:follow_up, subject: note)

        create(:project_membership, project: project, user: still_accessible_follow_up.user)
        create(:permission, user: still_accessible_follow_up.user, subject: note)

        note.remove_from_project!
        updated_event = note.events.updated_action.last!

        updated_event.process!

        assert_not FollowUp.exists?(no_more_access_follow_up.id)
        assert FollowUp.exists?(still_accessible_follow_up.id)
      end

      test "destroys favorites when project permission revoked and favorite owner doesn't have access" do
        note = create(:note)
        project = create(:project, organization: @org)
        note.add_to_project!(project: project)

        no_more_access_favorite = create(:favorite, favoritable: note)
        still_accessible_favorite = create(:favorite, favoritable: note)

        create(:permission, user: still_accessible_favorite.user, subject: note)

        note.remove_from_project!
        updated_event = note.events.updated_action.last!

        updated_event.process!

        assert_not Favorite.exists?(no_more_access_favorite.id)
        assert Favorite.exists?(still_accessible_favorite.id)
      end

      test "discards pin when changing project" do
        note = create(:note)
        note.update!(project: create(:project, organization: @org))
        pin = create(:project_pin, subject: note)
        updated_event = note.events.updated_action.first!

        updated_event.process!

        assert_predicate pin.reload, :discarded?
      end

      test "creates timeline event when added to a project" do
        Timecop.freeze do
          to_project = create(:project, organization: @org)
          @note.add_to_project!(project: to_project)
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.last!
          expected_metadata = { "from_project_id" => nil, "to_project_id" => to_project.id }

          assert_equal "subject_project_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "creates timeline event when removed from a project" do
        project = create(:project, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago) do
          @note.add_to_project!(project: project)
          @note.events.updated_action.last!.process!
        end

        Timecop.freeze do
          @note.remove_from_project!
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.reload.last!
          expected_metadata = { "from_project_id" => project.id, "to_project_id" => nil }

          assert_equal "subject_project_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "deletes previous timeline event when removed from a project if the rollup results in a loop" do
        project = create(:project, organization: @org)

        Timecop.freeze do
          @note.add_to_project!(project: project)
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.reload.last!
          expected_metadata = { "from_project_id" => nil, "to_project_id" => project.id }

          assert_equal "subject_project_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)

          @note.remove_from_project!
          @note.events.updated_action.last!.process!

          assert_not TimelineEvent.exists?(timeline_event.id)

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "replaces timeline event for project updates within rollup threshold" do
        Timecop.freeze do
          first_to_project = create(:project, organization: @org)
          @note.add_to_project!(project: first_to_project)
          @note.events.updated_action.last!.process!

          first_timeline_event = @note.timeline_events.last!
          first_expected_metadata = { "from_project_id" => nil, "to_project_id" => first_to_project.id }

          assert_equal "subject_project_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)

          second_to_project = create(:project, organization: @org)
          @note.add_to_project!(project: second_to_project)
          @note.events.updated_action.last!.process!

          second_timeline_event = @note.timeline_events.last!
          second_expected_metadata = { "from_project_id" => nil, "to_project_id" => second_to_project.id }

          assert_not TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_project_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "does not replace timeline event for project updates longer than rollup threshold" do
        first_timeline_event = nil
        first_to_project = create(:project, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago) do
          @note.add_to_project!(project: first_to_project)
          @note.events.updated_action.last!.process!

          first_timeline_event = @note.timeline_events.last!
          first_expected_metadata = { "from_project_id" => nil, "to_project_id" => first_to_project.id }

          assert_equal "subject_project_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end

        Timecop.freeze do
          second_to_project = create(:project, organization: @org)
          @note.add_to_project!(project: second_to_project)
          @note.events.updated_action.last!.process!

          second_timeline_event = @note.timeline_events.last!
          second_expected_metadata = { "from_project_id" => first_to_project.id, "to_project_id" => second_to_project.id }

          assert TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_project_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "creates timeline events for new post references" do
        post_reference = create(:post, organization: @org)

        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count
        note_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal @note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        note.update!(description_html: "")
        note.events.updated_action.last!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same post reference" do
        post_reference = create(:post, organization: @org)
        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create timeline events for circular post reference" do
        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{@note.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 0, @note.timeline_events.count
      end

      test "creates timeline events for comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count
        note_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal @note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        note.update!(description_html: "")
        note.events.updated_action.last!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same comment reference" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create timeline events for circular comment reference" do
        comment_reference = create(:comment, subject: @note)
        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.created_action.last!.process!

        assert_equal 0, @note.timeline_events.count
      end

      test "creates timeline events for new note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)

        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 1, note_reference.timeline_events.count
        note_reference_timeline_event = note_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal @note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "removes timeline events for removed note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, note_reference.timeline_events.count

        note.update!(description_html: "")
        note.events.updated_action.last!.process!

        assert_equal 0, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create multipe timeline events for the same note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        @note.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                     )

        @note.events.updated_action.last!.process!

        assert_equal 1, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create timeline events for circular note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        note_reference.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                              )

        note_reference.events.updated_action.last!.process!

        assert_equal 0, note_reference.timeline_events.count
      end

      test "creates timeline event for title updates when note is older than rollup threshold" do
        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @note.update!(title: "bar")
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.last!
          expected_metadata = { "from_title" => "Cool new note", "to_title" => "bar" }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "does not create timeline event for title updates when note is less than rollup threshold" do
        Timecop.freeze do
          @note.update!(title: "bar")
          @note.events.updated_action.last!.process!

          assert_nil @note.timeline_events.last
        end
      end

      test "replaces timeline event for title updates within rollup threshold" do
        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @note.update!(title: "bar")
          @note.events.updated_action.last!.process!

          first_timeline_event = @note.timeline_events.last!
          first_expected_metadata = { "from_title" => "Cool new note", "to_title" => "bar" }

          assert_equal "subject_title_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)

          @note.update!(title: "zoo")
          @note.events.updated_action.last!.process!

          second_timeline_event = @note.timeline_events.last!
          second_expected_metadata = { "from_title" => "Cool new note", "to_title" => "zoo" }

          assert_not TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_title_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "does not replace timeline event for title updates longer than rollup threshold" do
        first_timeline_event = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @note.update!(title: "bar")
          @note.events.updated_action.last!.process!

          first_timeline_event = @note.timeline_events.last!
          first_expected_metadata = { "from_title" => "Cool new note", "to_title" => "bar" }

          assert_equal "subject_title_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          @note.update!(title: "zar")
          @note.events.updated_action.last!.process!

          second_timeline_event = @note.timeline_events.last!
          second_expected_metadata = { "from_title" => "bar", "to_title" => "zar" }

          assert TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_title_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "creates timeline event for title updates when adding title" do
        @note = create(:note, member: @note_author, title: nil)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @note.update!(title: "bar")
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.last!
          expected_metadata = { "from_title" => nil, "to_title" => "bar" }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      test "creates timeline event for title updates when removing title" do
        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @note.update!(title: nil)
          @note.events.updated_action.last!.process!

          timeline_event = @note.timeline_events.last!
          expected_metadata = { "from_title" => "Cool new note", "to_title" => nil }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@note)
        end
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
