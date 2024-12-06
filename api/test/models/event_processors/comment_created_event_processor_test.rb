# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class CommentCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @author_member = create(:organization_membership, organization: @org)
        @post = create(:post, member: @author_member, organization: @org)
        @note = create(:note, member: @author_member)
      end

      test "notifies the post author" do
        comment = create(:comment, subject: @post)
        event = comment.events.created_action.first!

        event.process!

        assert_not_nil @author_member.notifications.parent_subscription.find_by(event: event)
        notification = event.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "enqueues Slack message when Slack notifications are enabled" do
        comment = create(:comment, subject: @post)
        event = comment.events.created_action.first!
        create(:integration_organization_membership, organization_membership: @author_member)
        @author_member.enable_slack_notifications!

        event.process!

        post_author_notification = @author_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [post_author_notification.id])
      end

      test "enqueues web pushes when they are enabled" do
        comment = create(:comment, subject: @post)
        event = comment.events.created_action.first!
        push1, push2 = create_list(:web_push_subscription, 2, user: @author_member.user)

        event.process!

        post_author_notification = @author_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [post_author_notification.id, push1.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [post_author_notification.id, push2.id])
      end

      test "notifies other post subscribers" do
        other_commenter_member = create(:organization_membership, organization: @org)
        create(:comment, subject: @post, member: other_commenter_member)
        comment = create(:comment, subject: @post.reload)
        event = comment.events.created_action.first!

        event.process!

        assert_not_nil other_commenter_member.notifications.parent_subscription.find_by(event: event)
        notification = event.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "does not email post subscribers with email notifications disabled" do
        comment = create(:comment, subject: @post)
        event = comment.events.created_action.first!
        preference = @post.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        assert_no_enqueued_emails do
          event.process!
        end
      end

      test "notifies mentioned org members" do
        mentioned_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post, body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")

        assert_not comment.subscriptions.exists?(user: mentioned_member.user)

        event = comment.events.created_action.first!
        event.process!

        assert mentioned_member.notifications.mention.find_by(event: event)
        assert comment.subscriptions.exists?(user: mentioned_member.user)
        notification = event.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "does not notify mentioned non-project members in private project" do
        mentioned_member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org, private: true)
        post = create(:post, organization: @org, project: project)
        comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")

        assert_not comment.subscriptions.exists?(user: mentioned_member.user)

        event = comment.events.created_action.first!
        event.process!

        assert_not mentioned_member.notifications.mention.exists?(event: event)
        assert_not comment.subscriptions.exists?(user: mentioned_member.user)
      end

      test "notifies mentioned project members in private project" do
        mentioned_member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org, private: true)
        create(:project_membership, organization_membership: mentioned_member, project: project)
        post = create(:post, organization: @org, project: project)
        comment = create(:comment, subject: post, body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        event = comment.events.created_action.first!

        event.process!

        assert mentioned_member.notifications.mention.exists?(event: event)
      end

      test "does not email mentioned org members with email notifications disabled" do
        mentioned_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post, body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        event = comment.events.created_action.first!
        preference = @post.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!
        preference = mentioned_member.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        assert_no_enqueued_emails do
          event.process!
        end
      end

      test "does not notify the comment creator if subscribed" do
        commenter_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post, member: commenter_member)
        event = comment.events.created_action.first!

        event.process!

        assert_nil commenter_member.notifications.parent_subscription.find_by(event: event)
      end

      test "only creates one notification if user subscribed and mentioned" do
        member = create(:organization_membership, organization: @org)
        create(:comment, subject: @post, member: member)
        comment = create(:comment, subject: @post.reload, body_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
        event = comment.events.created_action.first!

        assert_changes -> { member.notifications.count }, 1 do
          event.process!
        end

        assert member.notifications.mention.find_by(event: event)
        notification = event.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "reply notifies all post subscribers" do
        comment = create(:comment, subject: @post)
        reply1 = create(:comment, subject: @post, parent: comment)
        reply2 = create(:comment, subject: @post, parent: comment)
        reply3 = create(:comment, member: reply1.member, subject: @post, parent: comment)
        other_comment = create(:comment, subject: @post)
        event = reply3.events.created_action.first!

        event.process!

        assert_predicate event.notifications.find_by(organization_membership: comment.member), :present?
        assert_not_predicate event.notifications.find_by(organization_membership: reply1.member), :present?
        assert_predicate event.notifications.find_by(organization_membership: reply2.member), :present?
        assert_predicate event.notifications.find_by(organization_membership: other_comment.member), :present?
        assert_predicate event.notifications.find_by(organization_membership: @post.member), :present?
      end

      test "does not create notifications, emails, Slack messages or Pusher events if skip_notifications specified" do
        Sidekiq::Queues.clear_all
        comment = create(:comment, subject: @post, skip_notifications: true)
        event = comment.events.created_action.first!

        assert_no_enqueued_emails do
          assert_no_difference -> { Notification.count } do
            event.process!
          end
        end

        refute_enqueued_sidekiq_job(PusherTriggerJob)
        refute_enqueued_sidekiq_job(CreateSlackMessageJob)
      end

      test "updates the post's last_activity_at" do
        Timecop.freeze do
          @post.update!(last_activity_at: 1.day.ago)
          comment = create(:comment, subject: @post)
          event = comment.events.created_action.first!

          event.process!

          assert_in_delta Time.current, @post.reload.last_activity_at, 2.seconds
        end
      end

      test "updates the note's last_activity_at" do
        Timecop.freeze do
          @note.update!(last_activity_at: 1.day.ago)
          comment = create(:comment, subject: @note)
          event = comment.events.created_action.first!

          event.process!

          assert_in_delta Time.current, @note.reload.last_activity_at, 2.seconds
        end
      end

      test "reply updates the post's last_activity_at" do
        Timecop.freeze do
          @post.update!(last_activity_at: 1.day.ago)
          comment = create(:comment, subject: @post)
          reply = create(:comment, subject: @post, parent: comment)
          event = reply.events.created_action.first!

          event.process!

          assert_in_delta Time.current, @post.reload.last_activity_at, 2.seconds
        end
      end

      test "reply updates the note's last_activity_at" do
        Timecop.freeze do
          @note.update!(last_activity_at: 1.day.ago)
          comment = create(:comment, subject: @note)
          reply = create(:comment, subject: @note, parent: comment)
          event = reply.events.created_action.first!

          event.process!

          assert_in_delta Time.current, @note.reload.last_activity_at, 2.seconds
        end
      end

      test "enqueues posts-stale event" do
        comment = create(:comment, subject: @post)
        event = comment.events.created_action.first!

        event.process!

        assert_enqueued_sidekiq_job(
          PusherTriggerJob,
          args: [
            @post.organization.channel_name,
            "posts-stale",
            {
              user_id: @post.user.public_id,
              username: @post.user.username,
              project_ids: [@post.project.public_id],
              tag_names: [],
            }.to_json,
          ],
        )
      end

      context "timeline_events" do
        test "creates timeline events for post references" do
          post_reference = create(:post, organization: @org)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count
          comment_reference_timeline_event = post_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
          assert_equal comment, comment_reference_timeline_event.comment_reference
          assert_nil comment_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create multipe timelines event for the same post reference" do
          post_reference = create(:post, organization: @org)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create timeline events for circular post reference" do
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{@post.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 0, @post.timeline_events.count
        end

        test "creates timeline events for comment references" do
          post = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, post.timeline_events.count
          comment_reference_timeline_event = post.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
          assert_equal comment, comment_reference_timeline_event.comment_reference
          assert_nil comment_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end

        test "does not create multipe timelines event for the same comment reference" do
          post = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, post.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end

        test "does not create timeline events for circular comment reference" do
          comment_reference = create(:comment, subject: @post)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 0, @post.timeline_events.count
        end

        test "creates timeline events for note references" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, note_reference.timeline_events.count
          comment_reference_timeline_event = note_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
          assert_equal comment, comment_reference_timeline_event.comment_reference
          assert_nil comment_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "does not create multipe timelines event for the same note reference" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 1, note_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "does not create timeline events for circular note reference" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          comment = create(:comment, subject: note_reference, body_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          comment.events.created_action.first!.process!

          assert_equal 0, note_reference.timeline_events.count
        end
      end

      context "webhook_events" do
        setup do
          @webhook = create(:webhook, owner: create(:oauth_application, owner: @org), event_types: ["comment.created"])
        end

        test "enqueues comment.created event when a comment is created" do
          comment = create(:comment, subject: @post)

          comment.events.created_action.first!.process!

          assert_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "does not enqueue comment.created event when comment is on a note" do
          comment = create(:comment, subject: @note)

          comment.events.created_action.first!.process!

          refute_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "does not enqueue comment.created event for a comment on a private post" do
          project = create(:project, :private, organization: @org)
          post = create(:post, project: project, organization: project.organization)
          comment = create(:comment, subject: post)

          comment.events.created_action.first!.process!

          refute_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "enqueues app.mentioned event when app is mentioned in a comment" do
          @webhook.update(event_types: ["comment.created", "app.mentioned"])
          mention = MentionsFormatter.format_mention(@webhook.owner)
          comment = create(:comment, subject: @post, body_html: "Hey #{mention}")

          comment.events.created_action.first!.process!

          assert_enqueued_sidekiq_jobs(2, only: DeliverWebhookJob)

          assert_equal comment.id, WebhookEvent.where(event_type: "app.mentioned").first!.subject_id
        end

        test "does not enqueue app.mentioned event when the app does not have an active webhook" do
          @webhook.discard!
          mention = MentionsFormatter.format_mention(@webhook.owner)
          comment = create(:comment, subject: @post, body_html: "Hey #{mention}")

          comment.events.created_action.first!.process!

          refute_enqueued_sidekiq_job(DeliverWebhookJob)
        end
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
