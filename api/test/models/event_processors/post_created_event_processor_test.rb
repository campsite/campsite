# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before do
        @org = create(:organization)
      end

      test "notifies parent subscribers" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        another_subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: another_subscribed_member.user, subscribable: parent)
        iteration = create(:post, parent: parent, member: parent.member, organization: @org)
        event = iteration.events.created_action.first!

        assert_query_count 34 do
          event.process!
        end

        notifications = iteration.reload.notifications.parent_subscription
        assert_equal 2, notifications.count

        subscribed_member_notification = notifications.find_by(organization_membership: subscribed_member)
        assert_equal iteration, subscribed_member_notification.target
        assert_equal "#{parent.user.display_name} iterated on #{parent.title}", subscribed_member_notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [subscribed_member_notification.user.id, subscribed_member_notification.created_at.iso8601])

        another_subscribed_member_notification = notifications.find_by(organization_membership: another_subscribed_member)
        assert_equal iteration, subscribed_member_notification.target
        assert_equal "#{parent.user.display_name} iterated on #{parent.title}", another_subscribed_member_notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [another_subscribed_member_notification.user.id, another_subscribed_member_notification.created_at.iso8601])
      end

      test "enqueues Slack message when Slack notifications are enabled" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        iteration = create(:post, parent: parent, member: parent.member, organization: @org)
        event = iteration.events.created_action.first!
        create(:integration_organization_membership, organization_membership: subscribed_member)
        subscribed_member.enable_slack_notifications!

        event.process!

        subscribed_member_notification = subscribed_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [subscribed_member_notification.id])
      end

      test "enqueues web pushes when they are enabled" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        iteration = create(:post, parent: parent, member: parent.member, organization: @org)
        event = iteration.events.created_action.first!
        push1, push2 = create_list(:web_push_subscription, 2, user: subscribed_member.user)

        event.process!

        subscribed_member_notification = subscribed_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [subscribed_member_notification.id, push1.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [subscribed_member_notification.id, push2.id])
      end

      test "does not enqueue web pushes, emails, or Slack notifications when user has notifications paused" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        iteration = create(:post, parent: parent, member: parent.member, organization: @org)
        event = iteration.events.created_action.first!
        create(:web_push_subscription, user: subscribed_member.user)
        subscribed_member.user.update!(notification_pause_expires_at: 1.day.from_now)
        create(:integration_organization_membership, organization_membership: subscribed_member)
        subscribed_member.enable_slack_notifications!

        assert_difference -> { subscribed_member.notifications.count }, 1 do
          event.process!
        end

        refute_enqueued_sidekiq_job(DeliverWebPushNotificationJob)
        refute_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob)
        refute_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob)
      end

      test "iteration does not email parent subscribers with email notifications disabled" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        iteration = create(:post, parent: parent, member: parent.member, organization: @org)
        event = iteration.events.created_action.first!
        preference = subscribed_member.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        assert_no_enqueued_emails do
          event.process!
        end
      end

      test "iteration does not notify the post creator" do
        author_member = create(:organization_membership, organization: @org)
        parent = create(:post, organization: @org, member: author_member)
        iteration = create(:post, parent: parent, member: author_member, organization: @org)
        event = iteration.events.created_action.first!

        event.process!

        assert_equal 0, iteration.reload.notifications.count
      end

      test "does not notify with no parent" do
        post = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: post)
        event = post.events.created_action.first!

        event.process!

        assert_equal 0, post.reload.notifications.count
      end

      test "does not notify mention when there is also a feedback request" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        create(:post_feedback_request, post: post, member: mentioned_member)
        event = post.events.created_action.first!

        event.process!

        assert_equal 0, post.reload.notifications.count
      end

      test "notifies mentioned org members" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")

        assert_not post.subscriptions.exists?(user: mentioned_member.user)

        event = post.events.created_action.first!

        assert_query_count 30 do
          event.process!
        end

        notification = post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} mentioned you in #{post.title}", notification.summary_text
        assert post.subscriptions.exists?(user: mentioned_member.user)
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "does not notify mentioned non-project members in the private project" do
        project = create(:project, organization: @org, private: true)
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>", project: project)
        event = post.events.created_action.first!

        event.process!

        assert_not post.subscriptions.exists?(user: mentioned_member.user)
        assert_not post.reload.notifications.mention.exists?(organization_membership: mentioned_member)
      end

      test "notifies mentioned project members in private project" do
        project = create(:project, organization: @org, private: true)
        mentioned_member = create(:organization_membership, organization: @org)
        create(:project_membership, organization_membership: mentioned_member, project: project)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>", project: project)
        event = post.events.created_action.first!

        event.process!

        notification = post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} mentioned you in #{post.title}", notification.summary_text
        assert post.subscriptions.exists?(user: mentioned_member.user)
      end

      test "does not email mentioned org members with email notifications disabled" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        event = post.events.created_action.first!
        preference = mentioned_member.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        assert_no_enqueued_emails do
          event.process!
        end
      end

      test "notifies project subscribers" do
        member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: project)
        post = create(:post, organization: @org, project: project)
        event = post.events.created_action.first!

        assert_query_count 24 do
          event.process!
        end

        notification = post.reload.notifications.project_subscription.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} posted in #{project.name}", notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_not post.subscriptions.exists?(user: member.user)
      end

      test "creates post subscription for cascading project subscribers" do
        member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: project, cascade: true)
        post = create(:post, organization: @org, project: project)
        event = post.events.created_action.first!

        assert_query_count 29 do
          event.process!
        end

        notification = post.reload.notifications.project_subscription.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} posted in #{project.name}", notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert post.subscriptions.exists?(user: member.user)
      end

      test "only creates one notification for user who is subscribed to parent and project and is mentioned" do
        member = create(:organization_membership, organization: @org)
        parent = create(:post, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: parent)
        create(:user_subscription, user: member.user, subscribable: project)
        post = create(:post, organization: @org, project: project, parent: parent, description_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
        event = post.events.created_action.first!

        assert_difference -> { member.notifications.count }, 1 do
          event.process!
        end

        notification = post.reload.notifications.mention.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} mentioned you in #{post.title}", notification.summary_text
      end

      test "does not notify mentioned org members on draft post" do
        member = create(:organization_membership, organization: @org)
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
        event = post.events.created_action.first!

        event.process!

        assert_not post.reload.notifications.mention.exists?(organization_membership: member)
      end

      test "enqueues job to post to Slack when a user publishes a post" do
        Flipper.enable(:slack_auto_publish)
        post = create(:post)
        event = post.events.created_action.first!
        event.process!

        assert_enqueued_sidekiq_job(CreateSlackMessageJob, args: [post.id])
      end

      test "enqueues job to post to Slack when an integration publishes a post" do
        Flipper.enable(:slack_auto_publish, @org)
        integration = create(:integration, :zapier, owner: @org)
        post = create(:post, :from_integration, integration: integration, organization: @org)
        event = post.events.created_action.first!
        event.process!

        assert_enqueued_sidekiq_job(CreateSlackMessageJob, args: [post.id])
      end

      test "does not enqueue a job to post to Slack when post is created as published and the disable slack notifications ff is enabled" do
        Flipper.disable(:slack_auto_publish)
        post = create(:post)
        event = post.events.created_action.first!
        event.process!

        refute_enqueued_sidekiq_job(CreateSlackMessageJob, args: [post.id])
      end

      test "enqueues job to send Pusher event to project members and favoriters" do
        project_membership = create(:project_membership)
        favorite = create(:favorite, favoritable: project_membership.project)
        post = create(:post, project: project_membership.project)
        event = post.events.created_action.first!
        event.process!

        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [project_membership.organization_membership.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [favorite.organization_membership.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
      end

      test "does not enqueue job to send Pusher event to post author" do
        member = create(:organization_membership)
        project_membership = create(:project_membership, organization_membership: member)
        create(:favorite, favoritable: project_membership.project, organization_membership: member)
        post = create(:post, project: project_membership.project, member: member)
        event = post.events.created_action.first!
        event.process!

        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [member.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
      end

      test "enqueues job to send new-post, posts-stale, and project-memberships-stale Pusher events when published" do
        member = create(:organization_membership)
        project = create(:project, organization: member.organization)
        project_membership = create(:project_membership, project: project)
        post = create(:post, organization: member.organization, project: project)
        post.events.created_action.first!.process!

        assert_enqueued_sidekiq_job(
          PusherTriggerJob,
          args: [
            member.organization.channel_name,
            "new-post",
            { post_id: post.public_id, user_id: post.user.public_id }.to_json,
          ],
        )

        assert_enqueued_sidekiq_job(
          PusherTriggerJob,
          args: [
            member.organization.channel_name,
            "posts-stale",
            {
              user_id: post.user.public_id,
              username: post.user.username,
              project_ids: [project.public_id],
              tag_names: [],
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
      end

      test "does not enqueue new-post-in-project, new-post, posts-stale, and project-memberships-stale Pusher events when draft" do
        member = create(:organization_membership)
        project = create(:project, organization: member.organization)
        project_membership = create(:project_membership, project: project)
        post = create(:post, :draft, organization: member.organization, project: project)
        post.events.created_action.first!.process!

        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [project_membership.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [member.organization.channel_name, "new-post"])
        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [member.organization.channel_name, "posts-stale"])
        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [project_membership.user.channel_name, "project-memberships-stale"])
      end

      test "enqueues post-stale event for new post from integration" do
        project = create(:project)
        post = create(:post, :from_integration, project: project, organization: project.organization)
        post.events.created_action.first!.process!

        assert_enqueued_sidekiq_job(
          PusherTriggerJob,
          args: [
            project.organization.channel_name,
            "posts-stale",
            {
              user_id: nil,
              username: nil,
              project_ids: [project.public_id],
              tag_names: [],
            }.to_json,
          ],
        )
      end

      test "does not create notifications, emails, Slack messages or Pusher events if skip_notifications specified" do
        Flipper.enable(:slack_auto_publish)
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        Sidekiq::Queues.clear_all
        iteration = create(:post, parent: parent, member: parent.member, organization: @org, skip_notifications: true)
        event = iteration.events.created_action.first!

        assert_no_enqueued_emails do
          assert_no_difference -> { Notification.count } do
            event.process!
          end
        end

        refute_enqueued_sidekiq_job(PusherTriggerJob)
        refute_enqueued_sidekiq_job(CreateSlackMessageJob)
      end

      context "system_messages" do
        test "queues a system message job" do
          project = create(:project, organization: @org)
          sender = create(:organization_membership, organization: @org)
          message = create(:message, sender: sender)

          post = create(:post, from_message: message, project: project, organization: project.organization)
          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_jobs(2, only: InvalidateMessageJob)
        end

        test "does not queue a system message job for private spaces" do
          project = create(:project, :private, organization: @org)
          sender = create(:organization_membership, organization: @org)
          message = create(:message, sender: sender)

          post = create(:post, from_message: message, project: project, organization: project.organization)
          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_jobs(0, only: InvalidateMessageJob)
        end

        test "does not queue a system message job when post is draft" do
          project = create(:project, organization: @org)
          sender = create(:organization_membership, organization: @org)
          message = create(:message, sender: sender)

          post = create(:post, :draft, from_message: message, project: project, organization: project.organization)
          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_jobs(0, only: InvalidateMessageJob)
        end

        test "queues a system message job with post from integration" do
          project = create(:project, organization: @org)
          message = create(
            :message,
            oauth_application: create(:oauth_application, :zapier, owner: @org),
            message_thread: create(:message_thread, organization_memberships: create_list(:organization_membership, 2, organization: @org)),
            sender: nil,
          )

          post = create(:post, from_message: message, project: project, organization: project.organization)
          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_jobs(2, only: InvalidateMessageJob)
        end
      end

      test "updates project last_activity_at timestamp" do
        project = create(:project, last_activity_at: 5.minutes.ago)
        post = create(:post, project: project, organization: project.organization)

        Timecop.freeze do
          post.events.created_action.first!.process!

          assert_in_delta Time.current, project.last_activity_at, 2.seconds
        end
      end

      test "does not update project last_activity_at timestamp when draft" do
        initial_last_activity_at = 5.minutes.ago
        project = create(:project, last_activity_at: initial_last_activity_at)

        post = create(:post, :draft, project: project, organization: project.organization)

        Timecop.freeze do
          post.events.created_action.first!.process!

          # Account for precision differences between ruby and mysql datetime
          assert_in_delta initial_last_activity_at, project.last_activity_at, 0.001.seconds
        end
      end

      context "timeline_events" do
        test "creates timeline events for post references" do
          post_reference = create(:post, organization: @org)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count
          post_reference_timeline_event = post_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
          assert_equal post, post_reference_timeline_event.post_reference
          assert_nil post_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create multipe timeline events for the same post reference" do
          post_reference = create(:post, organization: @org)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create timeline events for post references when post is draft" do
          post_reference = create(:post, organization: @org)
          post_draft = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          post_draft.events.created_action.first!.process!

          assert_equal 0, post_reference.timeline_events.count
        end

        test "creates timeline events for comment references" do
          post_reference = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post_reference)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count
          post_reference_timeline_event = post_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
          assert_equal post, post_reference_timeline_event.post_reference
          assert_nil post_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create multipe timelines event for the same comment reference" do
          post_reference = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post_reference)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create timeline events for comment references when post is draft" do
          post_reference = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post_reference)
          post_draft = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )

          post_draft.events.created_action.first!.process!

          assert_equal 0, post_reference.timeline_events.count
        end

        test "creates timeline events for note reference" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, note_reference.timeline_events.count
          post_reference_timeline_event = note_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
          assert_equal post, post_reference_timeline_event.post_reference
          assert_nil post_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "does not create multipe timeline events for the same note reference" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          assert_equal 1, note_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "does not create timeline events for note references when post is draft" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post_draft = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )

          post_draft.events.created_action.first!.process!

          assert_equal 0, note_reference.timeline_events.count
        end

        test "creates timeline event for post with unfurled link" do
          project = create(:project, organization: @org)
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post = create(:post, project: project, organization: project.organization, unfurled_link: note_reference.url)

          post.events.created_action.first!.process!

          assert_equal note_reference.url, post.unfurled_link
          assert_equal 1, note_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "does not create timeline event for post with unfurled link when post is draft" do
          project = create(:project, organization: @org)
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post_draft = create(:post, :draft, project: project, organization: project.organization, unfurled_link: note_reference.url)

          post_draft.events.created_action.first!.process!

          assert_equal 0, note_reference.timeline_events.count
        end
      end

      context "webhook_events" do
        setup do
          @webhook = create(:webhook, owner: create(:oauth_application, owner: @org), event_types: ["post.created"])
        end

        test "enqueues post.created event when post is created" do
          post = create(:post, organization: @org)

          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_job(DeliverWebhookJob)
          assert_equal post.id, WebhookEvent.where(event_type: "post.created").first!.subject_id
        end

        test "does not enqueue post.created event when post is draft" do
          post_draft = create(:post, :draft, organization: @org)

          post_draft.events.created_action.first!.process!

          refute_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "does not enqueue post.created event when post is private" do
          project = create(:project, :private, organization: @org)
          post = create(:post, project: project, organization: project.organization)

          post.events.created_action.first!.process!

          refute_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "does enqueue post.created event when post is private and the app is a member of the project" do
          project = create(:project, :private, organization: @org)
          post = create(:post, project: project, organization: project.organization)
          project.add_oauth_application!(@org_oauth_app)

          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_job(DeliverWebhookJob)
        end

        test "enqueues app.mentioned event when app is mentioned in a post" do
          @webhook.update(event_types: ["app.mentioned"])
          mention = MentionsFormatter.format_mention(@webhook.owner)
          post = create(:post, organization: @org, description_html: "Hey #{mention}")

          post.events.created_action.first!.process!

          assert_enqueued_sidekiq_job(DeliverWebhookJob)

          mentioned_event = WebhookEvent.where(event_type: "app.mentioned").first!
          assert_equal "app.mentioned", mentioned_event.event_type
          assert_equal post.id, mentioned_event.subject_id
        end
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
