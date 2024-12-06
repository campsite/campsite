# frozen_string_literal: true

require "test_helper"

class ProcessEventJobTest < ActiveJob::TestCase
  context "perform" do
    test "it processes a Comment created event" do
      comment = create(:comment)
      event = comment.events.created_action.first!

      EventProcessors::CommentCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Comment updated event" do
      comment = create(:comment)
      comment.update!(body_html: "foobar")
      event = comment.events.updated_action.first!

      EventProcessors::CommentUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Comment destroyed event" do
      comment = create(:comment)
      comment.discard
      event = comment.events.destroyed_action.first!

      EventProcessors::CommentDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Post created event" do
      post = create(:post)
      event = post.events.created_action.first!

      EventProcessors::PostCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Post updated event" do
      post = create(:post)
      post.update!(description_html: "foobar")
      event = post.events.updated_action.first!

      EventProcessors::PostUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Post destroyed event" do
      post = create(:post)
      post.discard
      event = post.events.destroyed_action.first!

      EventProcessors::PostDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Reaction created event" do
      reaction = create(:reaction)
      event = reaction.events.created_action.first!

      EventProcessors::ReactionCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Reaction updated event" do
      reaction = create(:reaction)
      reaction.touch
      event = reaction.events.updated_action.first!

      EventProcessors::ReactionUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Reaction destroyed event" do
      reaction = create(:reaction)
      reaction.discard
      event = reaction.events.destroyed_action.first!

      EventProcessors::ReactionDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a PostFeedbackRequest created event" do
      feedback = create(:post_feedback_request)
      event = feedback.events.created_action.first!

      EventProcessors::PostFeedbackRequestCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it no-ops a PostFeedbackRequest created event if the feedback request is dismissed" do
      feedback = create(:post_feedback_request, :dismissed)
      event = feedback.events.created_action.first!

      ProcessEventJob.new.perform(event.id)

      assert_empty event.notifications.feedback_requested
      assert_predicate event.reload, :processed?
    end

    test "it processes a PostFeedbackRequest updated event" do
      feedback = create(:post_feedback_request)
      feedback.touch
      event = feedback.events.updated_action.first!

      EventProcessors::PostFeedbackRequestUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a PostFeedbackRequest destroyed event" do
      feedback = create(:post_feedback_request)
      feedback.discard
      event = feedback.events.destroyed_action.first!

      EventProcessors::PostFeedbackRequestDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a MessageThreadMembershipUpdate created event" do
      membership_update = create(:message_thread_membership_update)
      event = membership_update.events.created_action.first!

      EventProcessors::MessageThreadMembershipUpdateCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a MessageThread created event" do
      thread = create(:message_thread)
      event = thread.events.created_action.first!

      EventProcessors::MessageThreadCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a MessageThread updated event" do
      thread = create(:message_thread, :group)
      thread.update!(title: "foobar")
      event = thread.events.updated_action.first!

      EventProcessors::MessageThreadUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a MessageThread destroyed event" do
      thread = create(:message_thread)
      thread.discard
      event = thread.events.destroyed_action.first!

      EventProcessors::MessageThreadDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a ProjectMembership created event" do
      project_membership = create(:project_membership)
      event = project_membership.events.created_action.first!

      EventProcessors::ProjectMembershipCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a ProjectMembership updated event" do
      project_membership = create(:project_membership)
      project_membership.update!(position: 4)
      event = project_membership.events.updated_action.first!

      EventProcessors::ProjectMembershipUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a ProjectMembership destroyed event" do
      project_membership = create(:project_membership)
      project_membership.discard
      event = project_membership.events.destroyed_action.first!

      EventProcessors::ProjectMembershipDestroyedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Project created event" do
      project = create(:project)
      event = project.events.created_action.first!

      EventProcessors::ProjectCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Project updated event" do
      project = create(:project)
      project.archive!(create(:organization_membership, organization: project.organization))
      event = project.events.updated_action.first!

      EventProcessors::ProjectUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a FollowUp created event" do
      follow_up = create(:follow_up)
      event = follow_up.events.created_action.first!

      EventProcessors::FollowUpCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a FollowUp updated event" do
      follow_up = create(:follow_up)
      follow_up.show!
      event = follow_up.events.updated_action.first!

      EventProcessors::FollowUpUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Call created event" do
      call = create(:call)
      event = call.events.created_action.first!

      EventProcessors::CallCreatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it processes a Call updated event" do
      call = create(:call)
      call.update!(generated_summary_status: :completed)
      event = call.events.updated_action.first!

      EventProcessors::CallUpdatedEventProcessor.any_instance.expects(:process!)

      ProcessEventJob.new.perform(event.id)

      assert_predicate event.reload, :processed?
    end

    test "it doesnt process an event that has already been processed" do
      comment = create(:comment)
      event = comment.events.created_action.first!
      event.update!(processed_at: Time.current)

      EventProcessors::CommentCreatedEventProcessor.any_instance.expects(:process!).never

      ProcessEventJob.new.perform(event.id)
    end
  end
end
