# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post = create(:post, organization: @org)
      end

      test "discards notifications for the post" do
        mentioned_member = create(:organization_membership, organization: @org)
        @post.update!(description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        updated_event = @post.events.updated_action.first!

        updated_event.process!

        notification = @post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        assert_not_predicate notification, :discarded?

        @post.discard
        destroyed_event = @post.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_predicate notification.reload, :discarded?
      end

      test "destroys follow-ups for the post" do
        follow_up = create(:follow_up, subject: @post)
        @post.discard
        destroyed_event = @post.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_not FollowUp.exists?(follow_up.id)
      end

      test "destroys favorites for the post" do
        favorite = create(:favorite, favoritable: @post)
        @post.discard
        destroyed_event = @post.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_not Favorite.exists?(favorite.id)
      end

      test "discards pins for the post" do
        pin = create(:project_pin, subject: @post)
        @post.discard
        destroyed_event = @post.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_predicate pin.reload, :discarded?
      end

      test "enqueues Slack message deletion when message previously delivered" do
        mentioned_member = create(:organization_membership, organization: @org)
        @post.update!(description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        updated_event = @post.events.updated_action.first!

        updated_event.process!

        notification = @post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        notification.update!(slack_message_ts: "12345")

        @post.discard
        destroyed_event = @post.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_enqueued_sidekiq_job(DeleteNotificationSlackMessageJob, args: [notification.id])
      end

      test "triggers posts-stale and project-memberships-stale with pusher" do
        Timecop.freeze do
          project = create(:project, created_at: 1.month.ago, organization: @org)
          project_membership = create(:project_membership, project: project)
          tag = create(:tag, organization: @org)
          post = create(:post, organization: @org, project: project, tags: [tag])
          post.discard!
          event = post.events.destroyed_action.first!

          event.process!

          assert_enqueued_sidekiq_job(
            PusherTriggerJob,
            args: [
              @org.channel_name,
              "posts-stale",
              {
                user_id: post.user.public_id,
                username: post.user.username,
                project_ids: [project.public_id],
                tag_names: [tag.name],
              }.to_json,
            ],
          )

          assert_enqueued_sidekiq_job(
            PusherTriggerJob,
            args: [
              project_membership.user.channel_name,
              "project-memberships-stale",
              nil.to_json,
            ],
          )

          assert_in_delta project.created_at, project.reload.last_activity_at, 2.seconds
        end
      end

      test "does not trigger posts-stale for post from an integration" do
        post = create(:post, :from_integration)
        post.discard!
        event = post.events.destroyed_action.first!

        event.process!

        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [post.organization.channel_name, "posts-stale"])
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        post.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        post.discard_by_actor(post.user)
        post.events.destroyed_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        post.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        post.discard_by_actor(post.user)
        post.events.destroyed_action.first!.process!

        assert_equal 0, post_reference.reload.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        post.events.created_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count

        post.discard_by_actor(post.user)
        post.events.destroyed_action.first!.process!

        assert_equal 0, note_reference.reload.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
