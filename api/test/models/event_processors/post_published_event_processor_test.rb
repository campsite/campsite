# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostPublishedEventProcessorTest < ActiveSupport::TestCase
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
        iteration = create(:post, :draft, parent: parent, member: parent.member, organization: @org)
        iteration.publish!
        event = iteration.events.published_action.first!

        assert_query_count 35 do
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
        iteration = create(:post, :draft, parent: parent, member: parent.member, organization: @org)
        iteration.publish!
        event = iteration.events.published_action.first!
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
        iteration = create(:post, :draft, parent: parent, member: parent.member, organization: @org)
        iteration.publish!
        event = iteration.events.published_action.first!
        push1, push2 = create_list(:web_push_subscription, 2, user: subscribed_member.user)

        event.process!

        subscribed_member_notification = subscribed_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [subscribed_member_notification.id, push1.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [subscribed_member_notification.id, push2.id])
      end

      test "iteration does not email parent subscribers with email notifications disabled" do
        parent = create(:post, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: parent)
        iteration = create(:post, :draft, parent: parent, member: parent.member, organization: @org)
        iteration.publish!
        event = iteration.events.published_action.first!
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
        iteration = create(:post, :draft, parent: parent, member: author_member, organization: @org)
        iteration.publish!
        event = iteration.events.published_action.first!

        event.process!

        assert_equal 0, iteration.reload.notifications.count
      end

      test "does not notify with no parent" do
        post = create(:post, :draft, organization: @org)
        subscribed_member = create(:organization_membership, organization: @org)
        create(:user_subscription, user: subscribed_member.user, subscribable: post)
        post.publish!
        event = post.events.published_action.first!

        event.process!

        assert_equal 0, post.reload.notifications.count
      end

      test "does not notify mention when there is also a feedback request" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        create(:post_feedback_request, post: post, member: mentioned_member)
        post.publish!
        event = post.events.published_action.first!

        event.process!

        assert_equal 0, post.reload.notifications.count
      end

      test "notifies mentioned org members" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        post.publish!

        assert_not post.subscriptions.exists?(user: mentioned_member.user)

        event = post.events.published_action.first!

        assert_query_count 31 do
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
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>", project: project)
        post.publish!
        event = post.events.published_action.first!

        event.process!

        assert_not post.subscriptions.exists?(user: mentioned_member.user)
        assert_not post.reload.notifications.mention.exists?(organization_membership: mentioned_member)
      end

      test "notifies mentioned project members in private project" do
        project = create(:project, organization: @org, private: true)
        mentioned_member = create(:organization_membership, organization: @org)
        create(:project_membership, organization_membership: mentioned_member, project: project)
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>", project: project)
        post.publish!
        event = post.events.published_action.first!

        event.process!

        notification = post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} mentioned you in #{post.title}", notification.summary_text
        assert post.subscriptions.exists?(user: mentioned_member.user)
      end

      test "does not email mentioned org members with email notifications disabled" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, :draft, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        post.publish!
        event = post.events.published_action.first!
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
        post = create(:post, :draft, organization: @org, project: project)
        post.publish!
        event = post.events.published_action.first!

        assert_query_count 25 do
          event.process!
        end

        notification = post.reload.notifications.project_subscription.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} posted in #{project.name}", notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_not post.subscriptions.exists?(user: member.user)
      end

      test "creates post subscriptions for cascading project subscribers" do
        member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: project, cascade: true)
        post = create(:post, :draft, organization: @org, project: project)
        post.publish!
        event = post.events.published_action.first!

        assert_query_count 30 do
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
        post = create(:post, :draft, organization: @org, project: project, parent: parent, description_html: "<p>#{MentionsFormatter.format_mention(member)}</p>")
        post.publish!
        event = post.events.published_action.first!

        assert_difference -> { member.notifications.count }, 1 do
          event.process!
        end

        notification = post.reload.notifications.mention.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} mentioned you in #{post.title}", notification.summary_text
      end

      test "enqueues job to post to Slack when a user publishes a post" do
        Flipper.enable(:slack_auto_publish)
        post = create(:post, :draft)
        post.publish!
        event = post.events.published_action.first!
        event.process!

        assert_enqueued_sidekiq_job(CreateSlackMessageJob, args: [post.id])
      end

      test "does not enqueue a job to post to Slack when post is created as published and the disable slack notifications ff is enabled" do
        Flipper.disable(:slack_auto_publish)
        post = create(:post, :draft)
        post.publish!
        event = post.events.published_action.first!
        event.process!

        refute_enqueued_sidekiq_job(CreateSlackMessageJob, args: [post.id])
      end

      test "enqueues job to send Pusher event to project members and favoriters" do
        project_membership = create(:project_membership)
        favorite = create(:favorite, favoritable: project_membership.project)
        post = create(:post, :draft, project: project_membership.project)
        post.publish!
        event = post.events.published_action.first!
        event.process!

        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [project_membership.organization_membership.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [favorite.organization_membership.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
      end

      test "does not enqueue job to send Pusher event to post author" do
        member = create(:organization_membership)
        project_membership = create(:project_membership, organization_membership: member)
        create(:favorite, favoritable: project_membership.project, organization_membership: member)
        post = create(:post, :draft, project: project_membership.project, member: member)
        post.publish!
        event = post.events.published_action.first!
        event.process!

        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [member.user.channel_name, "new-post-in-project", { project_id: post.project.public_id }.to_json])
      end

      test "enqueues job to send new-post, posts-stale, and project-memberships-stale Pusher events when published" do
        member = create(:organization_membership)
        project = create(:project, organization: member.organization)
        project_membership = create(:project_membership, project: project)
        post = create(:post, :draft, organization: member.organization, project: project)
        post.publish!
        post.events.published_action.first!.process!

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

      test "updates project last_activity_at timestamp" do
        Timecop.freeze do
          project = create(:project, last_activity_at: 5.minutes.ago)
          post = create(:post, :draft, project: project, organization: project.organization, created_at: 10.minutes.ago)
          post.publish!

          post.events.published_action.first!.process!

          assert_in_delta Time.current, project.last_activity_at, 2.seconds
        end
      end

      context "system_messages" do
        test "queues a system message job" do
          project = create(:project, organization: @org)
          sender = create(:organization_membership, organization: @org)
          message = create(:message, sender: sender)

          post = create(:post, :draft, from_message: message, project: project, organization: project.organization)
          post.publish!
          event = post.events.published_action.first!
          event.process!

          assert_enqueued_sidekiq_jobs(2, only: InvalidateMessageJob)
        end

        test "does not queue a system message job for private spaces" do
          project = create(:project, :private, organization: @org)
          sender = create(:organization_membership, organization: @org)
          message = create(:message, sender: sender)

          post = create(:post, :draft, from_message: message, project: project, organization: project.organization)
          post.publish!
          event = post.events.published_action.first!
          event.process!

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

          post = create(:post, :draft, from_message: message, project: project, organization: project.organization)
          post.publish!
          event = post.events.published_action.first!
          event.process!

          assert_enqueued_sidekiq_jobs(2, only: InvalidateMessageJob)
        end
      end

      context "timeline_events" do
        test "creates timeline events for post references" do
          post_reference = create(:post, organization: @org)
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count
          post_reference_timeline_event = post_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
          assert_equal post, post_reference_timeline_event.post_reference
          assert_nil post_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "creates timeline events when publishing after drafted" do
          post_reference = create(:post, organization: @org)
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )

          post.events.created_action.first!.process!

          post.publish!

          post.events.published_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count
          post_reference_timeline_event = post_reference.timeline_events.first
          assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
          assert_equal post, post_reference_timeline_event.post_reference
          assert_nil post_reference_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "does not create multipe timeline events for the same post reference" do
          post_reference = create(:post, organization: @org)
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "creates timeline events for comment references" do
          post_reference = create(:post, organization: @org)
          comment_reference = create(:comment, subject: post_reference)
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

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
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

          assert_equal 1, post_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
        end

        test "creates timeline events for note reference" do
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

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
          post = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          HTML
          )
          post.publish!

          post.events.published_action.first!.process!

          assert_equal 1, note_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end

        test "creates timeline event for post with unfurled link" do
          project = create(:project, organization: @org)
          note_author = create(:organization_membership, organization: @org)
          note_reference = create(:note, member: note_author)
          post = create(:post, :draft, project: project, organization: project.organization, unfurled_link: note_reference.url)
          post.publish!

          post.events.published_action.first!.process!

          assert_equal note_reference.url, post.unfurled_link
          assert_equal 1, note_reference.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
        end
      end

      context "webhook_events" do
        test "enqueues webhook event when post is published" do
          post = create(:post, :draft, organization: @org)
          create(:webhook, owner: create(:oauth_application, owner: @org), event_types: ["post.created"])
          post.publish!

          post.events.published_action.first!.process!

          assert_enqueued_sidekiq_job(DeliverWebhookJob)
        end
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
