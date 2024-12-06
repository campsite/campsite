# frozen_string_literal: true

require "test_helper"

class ResetPostSubscriptionsForProjectJobTest < ActiveJob::TestCase
  setup do
    @project = create(:project)
    @organization = @project.organization
    @member = create(:organization_membership, organization: @organization)
    @project_subscription = create(:user_subscription, user: @member.user, subscribable: @project)
    @non_participating_post = create(:post, project: @project, organization: @organization)
    @authored_post = create(:post, project: @project, organization: @organization, member: @member)
    @commented_post = create(:post, project: @project, organization: @organization)
    create(:comment, subject: @commented_post, member: @member)
    @mentioned_post = create(:post, project: @project, organization: @organization, description_html: "<p>#{MentionsFormatter.format_mention(@member)}</p>")
    @mentioned_in_comments_post = create(:post, project: @project, organization: @organization)
    create(:comment, subject: @mentioned_in_comments_post, body_html: "<p>#{MentionsFormatter.format_mention(@member)}</p>")
  end

  describe "#perform" do
    test "when project subscription is cascading, subscribe to all posts" do
      @project_subscription.update!(cascade: true)

      assert_query_count 26 do
        ResetPostSubscriptionsForProjectJob.new.perform(@member.user.id, @project.id)
      end

      assert @non_participating_post.subscribers.include?(@member.user)
      assert @authored_post.subscribers.include?(@member.user)
      assert @commented_post.subscribers.include?(@member.user)
      assert @mentioned_post.subscribers.include?(@member.user)
      assert @mentioned_in_comments_post.subscribers.include?(@member.user)
    end

    test "when project subscription is not cascading, unsubscribe from all non-participating posts" do
      create(:user_subscription, user: @member.user, subscribable: @non_participating_post)

      assert_query_count 35 do
        ResetPostSubscriptionsForProjectJob.new.perform(@member.user.id, @project.id)
      end

      assert_not @non_participating_post.subscribers.include?(@member.user)
      assert @authored_post.subscribers.include?(@member.user)
      assert @commented_post.subscribers.include?(@member.user)
      assert @mentioned_post.subscribers.include?(@member.user)
      assert @mentioned_in_comments_post.subscribers.include?(@member.user)
    end

    test "no project subscription, unsubscribe from all non-participating posts" do
      @project_subscription.destroy!
      create(:user_subscription, user: @member.user, subscribable: @non_participating_post)

      assert_query_count 35 do
        ResetPostSubscriptionsForProjectJob.new.perform(@member.user.id, @project.id)
      end

      assert_not @non_participating_post.subscribers.include?(@member.user)
      assert @authored_post.subscribers.include?(@member.user)
      assert @commented_post.subscribers.include?(@member.user)
      assert @mentioned_post.subscribers.include?(@member.user)
      assert @mentioned_in_comments_post.subscribers.include?(@member.user)
    end
  end
end
