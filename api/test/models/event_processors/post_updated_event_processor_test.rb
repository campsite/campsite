# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post = create(:post, organization: @org)
      end

      test "notifies mentioned org members" do
        mentioned_member = create(:organization_membership, organization: @org)
        @post.update!(description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")

        assert_not @post.subscriptions.exists?(user: mentioned_member.user)

        event = @post.events.updated_action.first!

        assert_query_count 22 do
          event.process!
        end

        notification = @post.reload.notifications.mention.find_by!(organization_membership: mentioned_member)
        assert_equal @post, notification.target
        assert_equal "#{@post.user.display_name} mentioned you in #{@post.title}", notification.summary_text
        assert @post.subscriptions.exists?(user: mentioned_member.user)
      end

      test "does not send a second notification if mentioned users didn't change" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        created_event = post.events.created_action.first!
        created_event.process!

        assert_predicate created_event.notifications.where(organization_membership: mentioned_member), :one?

        post.update!(description_html: "<p>hi #{MentionsFormatter.format_mention(mentioned_member)}</p>")
        updated_event = post.events.updated_action.first!
        updated_event.process!

        assert_predicate updated_event.notifications.where(organization_membership: mentioned_member), :none?
      end

      test "notifies mentioned apps" do
        webhook = create(:webhook, owner: create(:oauth_application, owner: @org), event_types: ["app.mentioned"])
        @post.update!(description_html: "<p>#{MentionsFormatter.format_mention(webhook.owner)}</p>")

        event = @post.events.updated_action.first!
        event.process!

        assert_enqueued_sidekiq_job(DeliverWebhookJob)

        webhook_event = WebhookEvent.last!

        assert_equal "app.mentioned", webhook_event.event_type
        assert_equal @post, webhook_event.subject
      end

      test "does not notify mentioned apps if they didn't change" do
        webhook = create(:webhook, owner: create(:oauth_application, owner: @org), event_types: ["app.mentioned"])
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(webhook.owner)}</p>")

        assert_difference -> { WebhookEvent.where(event_type: "app.mentioned").count }, 1 do
          created_event = post.events.created_action.first!
          created_event.process!

          post.update!(description_html: "<p>hi #{MentionsFormatter.format_mention(webhook.owner)}</p>")
          updated_event = post.events.updated_action.first!
          updated_event.process!
        end
      end

      test "discards notification when moved to a private project notified doesn't have access to" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        created_event = post.events.created_action.first!
        created_event.process!
        notification = created_event.notifications.where(organization_membership: mentioned_member).first!
        post.update!(project: create(:project, :private, organization: @org))
        updated_event = post.events.updated_action.first!
        updated_event.process!

        assert_predicate notification.reload, :discarded?
      end

      test "destroys follow ups when moved to a private project follow up owner does have access to" do
        follow_up = create(:follow_up, subject: @post)
        comment_follow_up = create(:follow_up, subject: create(:comment, subject: @post))
        @post.update!(project: create(:project, :private, organization: @org))
        updated_event = @post.events.updated_action.first!

        updated_event.process!

        assert_not FollowUp.exists?(follow_up.id)
        assert_not FollowUp.exists?(comment_follow_up.id)
      end

      test "destroys favorites when moved to a private project favorite owner does have access to" do
        favorite = create(:favorite, favoritable: @post)
        @post.update!(project: create(:project, :private, organization: @org))
        updated_event = @post.events.updated_action.first!

        updated_event.process!

        assert_not Favorite.exists?(favorite.id)
      end

      test "discards pin when moving projects" do
        pin = create(:project_pin, subject: @post)
        @post.update!(project: create(:project, organization: @org))
        updated_event = @post.events.updated_action.first!

        updated_event.process!

        assert_predicate pin.reload, :discarded?
      end

      test "does not send a second mentioned notification when moving to a new project" do
        mentioned_member = create(:organization_membership, organization: @org)
        post = create(:post, organization: @org, description_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        created_event = post.events.created_action.first!
        created_event.process!

        assert_predicate created_event.notifications.where(organization_membership: mentioned_member), :one?

        post.update!(project: create(:project, organization: @org))
        updated_event = post.events.updated_action.first!
        updated_event.process!

        assert_predicate updated_event.notifications.where(organization_membership: mentioned_member), :none?
      end

      test "notifies project subscribers when moving to a new project" do
        member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: project)
        post = create(:post, organization: @org)
        post.update!(project: project)
        event = post.events.updated_action.first!

        assert_query_count 31 do
          event.process!
        end

        notification = post.reload.notifications.project_subscription.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} posted in #{project.name}", notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_not post.subscriptions.exists?(user: member.user)
      end

      test "creates post subscriptions for cascading project subscribers when moving to a new project" do
        member = create(:organization_membership, organization: @org)
        project = create(:project, organization: @org)
        create(:user_subscription, user: member.user, subscribable: project, cascade: true)
        post = create(:post, organization: @org)
        post.update!(project: project)
        event = post.events.updated_action.first!

        assert_query_count 36 do
          event.process!
        end

        notification = post.reload.notifications.project_subscription.find_by!(organization_membership: member)
        assert_equal post, notification.target
        assert_equal "#{post.user.display_name} posted in #{project.name}", notification.summary_text
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert post.subscriptions.exists?(user: member.user)
      end

      test "triggers posts-stale and project-memberships-stale Pusher events and updates project last_activity_at when moved projects" do
        Timecop.freeze do
          old_project = create(:project, organization: @org, created_at: 1.month.ago)
          new_project = create(:project, organization: @org, created_at: 1.month.ago)
          project_membership = create(:project_membership, project: old_project)
          post = create(:post, organization: @org, project: old_project)
          post.update!(project: new_project)
          event = post.events.updated_action.last!

          event.process!

          assert_enqueued_sidekiq_job(
            PusherTriggerJob,
            args: [
              @org.channel_name,
              "posts-stale",
              {
                user_id: post.user.public_id,
                username: post.user.username,
                project_ids: [new_project.public_id, old_project.public_id],
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

          assert_in_delta old_project.created_at, old_project.reload.last_activity_at, 2.seconds
          assert_in_delta Time.current, new_project.reload.last_activity_at, 2.seconds
        end
      end

      test "does not trigger posts-stale Pusher event when only updated_at changes" do
        post = create(:post, organization: @org)
        Sidekiq::Queues.clear_all
        post.touch
        event = post.events.updated_action.last!

        event.process!

        refute_enqueued_sidekiq_job(PusherTriggerJob)
      end

      test "sends resolved notifications to all subscribers and author" do
        resolver = create(:organization_membership, organization: @org)
        subscriber = create(:organization_membership, organization: @org)
        create(:integration_organization_membership, organization_membership: subscriber)
        subscriber.enable_slack_notifications!
        push = create(:web_push_subscription, user: subscriber.user)

        @post.subscriptions.create!(user: resolver.user)
        @post.subscriptions.create!(user: subscriber.user)

        @post.resolve!(actor: resolver, html: nil, comment_id: nil)
        event = @post.events.updated_action.first!

        event.process!

        subscriber_notification = @post.notifications.kept.post_resolved.find_by(organization_membership: subscriber)

        assert_not_nil @post.reload.notifications.kept.post_resolved.find_by(organization_membership: @post.member)
        assert_nil @post.notifications.kept.post_resolved.find_by(organization_membership: resolver)
        assert_not_nil subscriber_notification

        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [subscriber_notification.user.id, subscriber_notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [subscriber_notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [subscriber_notification.id, push.id])
      end

      test "sends resolved notifications to all subscribers, author, and commenter" do
        comment = create(:comment, subject: @post)
        resolver = create(:organization_membership, organization: @org)
        subscriber = create(:organization_membership, organization: @org)

        @post.subscriptions.create!(user: resolver.user)
        @post.subscriptions.create!(user: subscriber.user)

        @post.resolve!(actor: resolver, html: nil, comment_id: comment.public_id)
        event = @post.events.updated_action.first!

        event.process!

        assert_not_nil @post.reload.notifications.kept.post_resolved.find_by(organization_membership: @post.member)
        assert_nil @post.notifications.kept.post_resolved.find_by(organization_membership: resolver)
        assert_nil @post.notifications.kept.post_resolved.find_by(organization_membership: comment.member)
        assert_not_nil @post.notifications.kept.post_resolved.find_by(organization_membership: subscriber)
        assert_not_nil @post.notifications.kept.post_resolved_from_comment.find_by(organization_membership: comment.member)
      end

      test "sends resolved notifications to all subscribers, author, and commenter when actor is an oauth app" do
        comment = create(:comment, subject: @post)
        resolver = create(:oauth_application, owner: @org)
        subscriber = create(:organization_membership, organization: @org)

        @post.subscriptions.create!(user: subscriber.user)

        @post.resolve!(actor: resolver, html: nil, comment_id: comment.public_id)
        event = @post.events.updated_action.first!

        event.process!

        assert_not_nil @post.reload.notifications.kept.post_resolved.find_by(organization_membership: @post.member)
        assert_nil @post.notifications.kept.post_resolved.find_by(organization_membership: comment.member)
        assert_not_nil @post.notifications.kept.post_resolved.find_by(organization_membership: subscriber)
        assert_not_nil @post.notifications.kept.post_resolved_from_comment.find_by(organization_membership: comment.member)
      end

      test "discards resolve notifications when unresolving" do
        resolver = create(:organization_membership, organization: @org)
        subscriber = create(:organization_membership, organization: @org)
        create(:integration_organization_membership, organization_membership: subscriber)

        @post.subscriptions.create!(user: subscriber.user)

        @post.resolve!(actor: resolver, html: nil, comment_id: nil)
        @post.events.updated_action.last!.process!

        assert_not_nil @post.notifications.kept.post_resolved.find_by(organization_membership: subscriber)

        @post.unresolve!(actor: resolver)
        @post.events.updated_action.last!.process!

        assert_nil @post.notifications.kept.post_resolved.find_by(organization_membership: subscriber)
      end

      test "discards resolved from comment notifications when unresolving" do
        resolver = create(:organization_membership, organization: @org)
        commenter = create(:organization_membership, organization: @org)
        comment = create(:comment, member: commenter, subject: @post)

        @post.resolve!(actor: resolver, html: nil, comment_id: comment.public_id)
        @post.events.updated_action.last!.process!

        assert_not_nil @post.notifications.kept.post_resolved_from_comment.find_by(organization_membership: commenter)

        @post.unresolve!(actor: resolver)
        @post.events.updated_action.last!.process!

        assert_nil @post.notifications.kept.post_resolved_from_comment.find_by(organization_membership: commenter)
      end

      test "creates timeline event for title updates when post is older than rollup threshold" do
        post = create(:post, organization: @org, title: "foo")

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post.update!(title: "bar")
          post.events.updated_action.last!.process!

          timeline_event = post.timeline_events.last!
          expected_metadata = { "from_title" => "foo", "to_title" => "bar" }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end
      end

      test "does not create timeline event for title updates when post is less than rollup threshold" do
        Timecop.freeze do
          post = create(:post, organization: @org, title: "foo")
          post.update!(title: "bar")
          post.events.updated_action.last!.process!

          assert_nil post.timeline_events.last
        end
      end

      test "replaces timeline event for title updates within rollup threshold" do
        post = create(:post, organization: @org, title: "foo")

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post.update!(title: "bar")
          post.events.updated_action.last!.process!

          first_timeline_event = post.timeline_events.last!
          first_expected_metadata = { "from_title" => "foo", "to_title" => "bar" }

          assert_equal "subject_title_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)

          post.update!(title: "zoo")
          post.events.updated_action.last!.process!

          second_timeline_event = post.timeline_events.last!
          second_expected_metadata = { "from_title" => "foo", "to_title" => "zoo" }

          assert_not TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_title_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end
      end

      test "does not replace timeline event for title updates longer than rollup threshold" do
        post = create(:post, organization: @org, title: "foo")
        first_timeline_event = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post.update!(title: "bar")
          post.events.updated_action.last!.process!

          first_timeline_event = post.timeline_events.last!
          first_expected_metadata = { "from_title" => "foo", "to_title" => "bar" }

          assert_equal "subject_title_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          post.update!(title: "zar")
          post.events.updated_action.last!.process!

          second_timeline_event = post.timeline_events.last!
          second_expected_metadata = { "from_title" => "bar", "to_title" => "zar" }

          assert TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_title_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end
      end

      test "creates timeline event for title updates when adding title" do
        post = create(:post, organization: @org, title: nil)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post.update!(title: "bar")
          post.events.updated_action.last!.process!

          timeline_event = post.timeline_events.last!
          expected_metadata = { "from_title" => nil, "to_title" => "bar" }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end
      end

      test "creates timeline event for title updates when removing title" do
        post = create(:post, organization: @org, title: "foo")

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post.update!(title: nil)
          post.events.updated_action.last!.process!

          timeline_event = post.timeline_events.last!
          expected_metadata = { "from_title" => "foo", "to_title" => nil }

          assert_equal "subject_title_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(post)
        end
      end
      test "does not create timeline event for title updates when post is draft" do
        post_draft = create(:post, :draft, organization: @org, title: nil)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post_draft.update!(title: "bar")
          post_draft.events.updated_action.last!.process!

          assert_equal 0, post_draft.timeline_events.count
        end
      end

      test "creates timeline event for when resolving" do
        resolver = create(:organization_membership, organization: @org)
        @post.resolve!(actor: resolver, html: nil, comment_id: nil)
        @post.events.updated_action.last!.process!

        timeline_event = @post.timeline_events.last!

        assert_equal "post_resolved", timeline_event.action
        assert_nil timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(@post)
      end

      test "creates post resolved timeline event if the previous post unresolved timeline event is longer than rollup threshold" do
        resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          @post.unresolve!(actor: resolver)
          @post.events.updated_action.last!.process!

          assert_not @post.resolved?
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 3).from_now) do
          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!

          assert_equal 3, @post.timeline_events.count
          assert_equal "post_resolved", timeline_event.action
          assert_nil timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "creates post resolved timeline event if the previous post unresolved event has different actor" do
        first_resolver = create(:organization_membership, organization: @org)
        second_resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: first_resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          @post.unresolve!(actor: first_resolver)
          @post.events.updated_action.last!.process!

          assert_not @post.resolved?

          @post.resolve!(actor: second_resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!

          assert_equal 3, @post.timeline_events.count
          assert_equal "post_resolved", timeline_event.action
          assert_nil timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "deletes previous post unresolved timeline event if new post resolved timeline event is created by same actor within rollup threshold" do
        resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          @post.unresolve!(actor: resolver)
          @post.events.updated_action.last!.process!

          assert_not @post.resolved?

          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!

          assert_equal 1, @post.timeline_events.count
          assert_equal "post_resolved", timeline_event.action
          assert_nil timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "creates post unresolved timeline event if the previous post resolved timeline event is longer than rollup threshold" do
        resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          @post.unresolve!(actor: resolver)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!

          assert_equal 2, @post.timeline_events.count
          assert_equal "post_unresolved", timeline_event.action
          assert_nil timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "creates post unresolved timeline event if the previous post resolved event has different actor" do
        first_resolver = create(:organization_membership, organization: @org)
        second_resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: first_resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?

          @post.unresolve!(actor: second_resolver)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!

          assert_equal 2, @post.timeline_events.count
          assert_equal "post_unresolved", timeline_event.action
          assert_nil timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "deletes previous post resolved timeline event if new post unresolved timeline event is created by same actor within rollup threshold" do
        resolver = create(:organization_membership, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          @post.resolve!(actor: resolver, html: nil, comment_id: nil)
          @post.events.updated_action.last!.process!

          assert @post.resolved?

          @post.unresolve!(actor: resolver)
          @post.events.updated_action.last!.process!

          assert_equal 0, @post.timeline_events.count

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "creates timeline event for project updates" do
        Timecop.freeze do
          from_project = @post.project
          to_project = create(:project, organization: @org)
          @post.update!(project: to_project)
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!
          expected_metadata = { "from_project_id" => from_project.id, "to_project_id" => to_project.id }

          assert_equal "subject_project_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "creates timeline event for project updates with actor attribution" do
        Timecop.freeze do
          admin = create(:organization_membership, :admin, organization: @org)
          from_project = @post.project
          to_project = create(:project, organization: @org)
          @post.update_post(actor: admin, organization: @org, project: to_project, params: {})
          @post.events.updated_action.last!.process!

          timeline_event = @post.timeline_events.last!
          expected_metadata = { "from_project_id" => from_project.id, "to_project_id" => to_project.id }

          assert_equal "subject_project_updated", timeline_event.action
          assert_equal expected_metadata, timeline_event.metadata
          assert_equal admin, timeline_event.actor

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "replaces timeline event for project updates within rollup threshold" do
        Timecop.freeze do
          from_project = @post.project
          first_to_project = create(:project, organization: @org)
          @post.update!(project: first_to_project)
          @post.events.updated_action.last!.process!

          first_timeline_event = @post.timeline_events.last!
          first_expected_metadata = { "from_project_id" => from_project.id, "to_project_id" => first_to_project.id }

          assert_equal "subject_project_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)

          second_to_project = create(:project, organization: @org)
          @post.update!(project: second_to_project)
          @post.events.updated_action.last!.process!

          second_timeline_event = @post.timeline_events.last!
          second_expected_metadata = { "from_project_id" => from_project.id, "to_project_id" => second_to_project.id }

          assert_not TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_project_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "does not replace timeline event for project updates longer than rollup threshold" do
        first_timeline_event = nil
        from_project = @post.project
        first_to_project = create(:project, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago) do
          @post.update!(project: first_to_project)
          @post.events.updated_action.last!.process!

          first_timeline_event = @post.timeline_events.last!
          first_expected_metadata = { "from_project_id" => from_project.id, "to_project_id" => first_to_project.id }

          assert_equal "subject_project_updated", first_timeline_event.action
          assert_equal first_expected_metadata, first_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end

        Timecop.freeze do
          second_to_project = create(:project, organization: @org)
          @post.update!(project: second_to_project)
          @post.events.updated_action.last!.process!

          second_timeline_event = @post.timeline_events.last!
          second_expected_metadata = { "from_project_id" => first_to_project.id, "to_project_id" => second_to_project.id }

          assert TimelineEvent.exists?(first_timeline_event.id)
          assert_equal "subject_project_updated", second_timeline_event.action
          assert_equal second_expected_metadata, second_timeline_event.metadata

          assert_enqueued_subject_timeline_stale_pusher_event(@post)
        end
      end

      test "does not create timeline events for project updates when post is draft" do
        post_draft = create(:post, :draft, organization: @org)

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post_draft.update!(project: create(:project, organization: @org))
          post_draft.events.updated_action.last!.process!

          assert_equal 0, post_draft.timeline_events.count
        end
      end

      test "creates timeline event for visibility updates" do
        assert @post.default_visibility?

        @post.update!(visibility: :public)
        @post.events.updated_action.last!.process!

        timeline_event = @post.timeline_events.last!
        expected_metadata = { "from_visibility" => Post.visibilities[:default], "to_visibility" => Post.visibilities[:public] }

        assert_equal "post_visibility_updated", timeline_event.action
        assert_equal expected_metadata, timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(@post)
      end

      test "creates timeline events for new post references" do
        post_reference = create(:post, organization: @org)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count
        post_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
        assert_equal @post, post_reference_timeline_event.post_reference
        assert_nil post_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create timeline events for post references when post is draft" do
        post_reference = create(:post, organization: @org)
        post_draft = create(:post, :draft, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        post_draft.update!(visibility: :public)
        post_draft.events.updated_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        post = create(:post, organization: @org, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        post.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        post.update!(description_html: "")
        post.events.updated_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same post reference" do
        post_reference = create(:post, organization: @org)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create timeline events for circular post reference" do
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{@post.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

        assert_equal 0, @post.timeline_events.count
      end

      test "creates timeline events for comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count
        post_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
        assert_equal @post, post_reference_timeline_event.post_reference
        assert_nil post_reference_timeline_event.metadata

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

        post.update!(description_html: "")
        post.events.updated_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same comment reference" do
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

      test "does not create timeline events for circular comment reference" do
        comment_reference = create(:comment, subject: @post)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.created_action.first!.process!

        assert_equal 0, @post.timeline_events.count
      end

      test "does not create timeline events for note references when post is draft" do
        post_draft = create(:post, :draft, organization: @org)
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        post_draft.update!(description_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                          )

        post_draft.events.updated_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count
      end

      test "creates timeline events for new note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count
        post_reference_timeline_event = note_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", post_reference_timeline_event.action
        assert_equal @post, post_reference_timeline_event.post_reference
        assert_nil post_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
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

        post.update!(description_html: "")
        post.events.updated_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create multipe timeline events for the same note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        @post.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                     )

        @post.events.updated_action.first!.process!

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

        note_reference.events.updated_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count
      end

      test "does not create timeline events for note references when post is draft" do
        post_draft = create(:post, :draft, organization: @org)
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        post_draft.update!(description_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                          )

        post_draft.events.updated_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
