# frozen_string_literal: true

require "test_helper"

class OrganizationMailerTest < ActionMailer::TestCase
  setup do
    @organization = create(:organization, name: "FooBarBaz")
    @member = create(:organization_membership, organization: @organization)
    @user = @member.user
    @app_mailer = ApplicationMailer.new
  end

  describe "#invite_member" do
    setup do
      @invitation = create(:organization_invitation, organization: @organization, sender: @user)
      @mail = described_class.invite_member(@invitation).deliver_now

      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "#{@user.display_name} invited you to FooBarBaz on Campsite", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @invitation.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders an invitation link" do
      assert_includes @html_body, @invitation.invitation_url
    end

    test "renders an invited project" do
      project = create(:project, organization: @organization)
      @invitation.update!(projects: [project])

      mail = described_class.invite_member(@invitation).deliver_now
      html_body = mail.html_part.body.to_s

      assert_includes html_body, "<b>#{project.name}</b> in"
    end

    test "renders two invited projects" do
      projects = create_list(:project, 2, organization: @organization)
      @invitation.update!(projects: projects)

      mail = described_class.invite_member(@invitation).deliver_now
      html_body = mail.html_part.body.to_s

      assert_includes html_body, "<b>#{projects.first.name}</b> and <b>#{projects.second.name}</b> in"
    end

    test "renders three invited projects" do
      projects = create_list(:project, 3, organization: @organization)
      @invitation.update!(projects: projects)

      mail = described_class.invite_member(@invitation).deliver_now
      html_body = mail.html_part.body.to_s

      assert_includes html_body, "<b>#{projects.first.name}</b> and #{projects.size - 1} other spaces in"
    end
  end

  describe "#member_removed" do
    setup do
      @membership = create(:organization_membership, organization: @organization)
      @mail = described_class.member_removed(@membership.user, @membership.organization).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "You were removed as a member from FooBarBaz on Campsite", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @membership.user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders the organization name" do
      assert_includes @html_body, "FooBarBaz"
    end
  end

  describe "#membership_request" do
    setup do
      @request = create(:organization_membership_request, organization: @organization)
      @mail = described_class.membership_request(@request, @user).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "#{@request.user.display_name} requested to join FooBarBaz on Campsite", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders the requester name" do
      assert_includes @html_body, @request.user.display_name
    end
  end

  describe "#daily_digest" do
    test "renders digest with one post" do
      post = create(:post, organization: @organization)
      @mail = described_class.daily_digest(@member, [post]).deliver_now
      @html_body = @mail.html_part.body.to_s

      assert_includes @html_body, post.url
    end

    test "renders digest with multiple posts" do
      post1 = create(:post, organization: @organization)
      post2 = create(:post, organization: @organization)
      post3 = create(:post, organization: @organization)
      post4 = create(:post, organization: @organization)
      post_from_integration = create(:post, :from_integration, organization: @organization)

      @mail = described_class.daily_digest(@member, [post1, post2, post3, post4, post_from_integration]).deliver_now
      @html_body = @mail.html_part.body.to_s

      assert_includes @html_body, post1.url
      assert_includes @html_body, post2.url
      assert_includes @html_body, post3.url
      assert_includes @html_body, post4.url
      assert_includes @html_body, post_from_integration.url
    end

    test "renders unique members and integrations" do
      oauth_application = create(:oauth_application, :zapier)
      user_posts = create_list(:post, 3, organization: @organization)
      integration_posts = create_list(:post, 3, :from_oauth_application, oauth_application: oauth_application, organization: @organization)

      @mail = described_class.daily_digest(@member, [*user_posts, *integration_posts]).deliver_now
      @html_body = @mail.html_part.body.to_s

      # 3 posts + 1 avatar in the facepile
      assert_equal 4, @html_body.scan("static/avatars/service-zapier.png").size
      # 3 posts from 3 different users
      assert_equal 6, @html_body.scan("static/avatars/H.png").size
    end
  end

  describe "#bundled_notifications" do
    test "renders title one notification" do
      post = create(:post, organization: @member.organization)
      event = post.events.created_action.first!
      notification = create(:notification, :mention, organization_membership: @member, event: event, target: post)
      mail = described_class.bundled_notifications(@member.user, @member.organization, [notification], []).deliver_now

      assert_equal "🏕️ #{notification.summary.text}", mail.subject
    end

    test "renders title multiple notifications" do
      post = create(:post, organization: @member.organization)
      event = post.events.created_action.first!
      notifications = [
        create(:notification, :mention, organization_membership: @member, event: event, target: post),
        create(:notification, :mention, organization_membership: @member, event: event, target: post),
      ]
      mail = described_class.bundled_notifications(@member.user, @member.organization, notifications, []).deliver_now

      assert_equal "🏕️ 2 unread notifications in #{@organization.name}", mail.subject
    end

    test "renders title for one message notification" do
      message_notification = create(:message_notification, organization_membership: @member)

      mail = described_class.bundled_notifications(@member.user, @member.organization, [], [message_notification]).deliver_now

      assert_equal "🏕️ Unread messages from #{message_notification.message_thread.formatted_title(@member)}", mail.subject
    end

    test "renders title for multiple message notifications" do
      message_notifications = create_list(:message_notification, 2, organization_membership: @member)

      mail = described_class.bundled_notifications(@member.user, @member.organization, [], message_notifications).deliver_now

      assert_equal "🏕️ Unread messages in #{@member.organization.name}", mail.subject
    end

    test "renders title for multiple notifications and message notifications" do
      post = create(:post, organization: @member.organization)
      event = post.events.created_action.first!
      notifications = [
        create(:notification, :mention, organization_membership: @member, event: event, target: post),
        create(:notification, :mention, organization_membership: @member, event: event, target: post),
      ]
      message_notifications = create_list(:message_notification, 2, organization_membership: @member)

      mail = described_class.bundled_notifications(@member.user, @member.organization, notifications, message_notifications).deliver_now

      assert_equal "🏕️ Unread notifications and messages in #{@member.organization.name}", mail.subject
    end

    test "renders body with various notifications" do
      post = create(:post, organization: @member.organization)
      post_event = post.events.created_action.first!
      integration_post = create(:post, :from_integration, organization: @member.organization)
      integration_post_event = integration_post.events.created_action.first!
      comment = create(:comment, subject: post)
      comment_event = comment.events.created_action.first!
      feedback = create(:post_feedback_request, post: post)
      feedback_event = feedback.events.created_action.first!
      project = create(:project, organization: @member.organization)
      project_membership = create(:project_membership, project: project, organization_membership: @member)
      project_membership_event = project_membership.events.created_action.first!
      project.archive!(create(:organization_membership, organization: project.organization))
      project_archived_event = project.events.updated_action.first!
      note = create(:note, member: @member)
      note_permission = create(:permission, user: @member.user, subject: note)
      note_permission_event = note_permission.events.created_action.first!
      follow_up = create(:follow_up, organization_membership: @member, subject: post)
      follow_up.show!
      follow_up_event = follow_up.events.updated_action.first!
      comment_follow_up = create(:follow_up, organization_membership: @member, subject: comment)
      comment_follow_up.show!
      comment_follow_up_event = comment_follow_up.events.updated_action.first!
      note_follow_up = create(:follow_up, organization_membership: @member, subject: note)
      note_follow_up.show!
      note_follow_up_event = note_follow_up.events.updated_action.first!
      call = create(:call, organization: @member.organization)
      create(:call_peer, call: call, organization_membership: @member)
      call.update!(generated_summary_status: :completed, generated_title_status: :completed)
      call_event = call.events.updated_action.first!
      notifications = [
        create(:notification, :mention, organization_membership: @member, event: post_event, target: post),
        create(:notification, :parent_subscription, organization_membership: @member, event: post_event, target: post),
        create(:notification, :project_subscription, organization_membership: @member, event: post_event, target: post),
        create(:notification, :project_subscription, organization_membership: @member, event: integration_post_event, target: integration_post),

        create(:notification, :mention, organization_membership: @member, event: comment_event, target: comment.subject),
        create(:notification, :parent_subscription, organization_membership: @member, event: comment_event, target: comment.subject),

        create(:notification, :feedback_requested, organization_membership: @member, event: feedback_event, target: post),

        create(:notification, :added, organization_membership: @member, event: project_membership_event, target: project),
        create(:notification, :permission_granted, organization_membership: @member, event: note_permission_event, target: note),

        create(:notification, :subject_archived, organization_membership: @member, event: project_archived_event, target: project),

        create(:notification, :follow_up, organization_membership: @member, event: follow_up_event, target: post),
        create(:notification, :follow_up, organization_membership: @member, event: comment_follow_up_event, target: post),
        create(:notification, :follow_up, organization_membership: @member, event: note_follow_up_event, target: note),

        create(:notification, :processing_complete, organization_membership: @member, event: call_event, target: call),
      ]
      mail = described_class.bundled_notifications(@member.user, @member.organization, notifications, []).deliver_now
      html_body = mail.html_part.body.to_s

      # post summaries
      assert_includes html_body, "mentioned you in a post"
      assert_includes html_body, "iterated on a post you follow"
      assert_includes html_body, "posted in"
      # comment summaries
      assert_includes html_body, "commented on"
      assert_includes html_body, "mentioned you in a comment"
      # feedback summaries
      assert_includes html_body, "requested your feedback"
      # permission summaries
      assert_includes html_body, "View note"
      # ProjectMembership summary
      assert_includes html_body, "added you to"
      assert_includes html_body, "View channel"
      # project archived summary
      assert_includes html_body, "archived"
      # integrations
      assert_includes html_body, "Zapier"
      # follow up
      assert_includes html_body, "Follow up"
      # call
      assert_includes html_body, "View call"
    end
  end

  describe "#demo_orgs" do
    test "does not send mail to demo orgs" do
      organization = create(:organization, name: "FooBarBaz", demo: true)
      invitation = create(:organization_invitation, organization: organization, sender: @user)

      mail = described_class.invite_member(invitation).deliver_now

      assert_not mail
    end
  end

  describe "#join_via_guest_link" do
    setup do
      @organization_membership = create(:organization_membership, :guest)
      @organization = @organization_membership.organization
      @project = create(:project, organization: @organization)
      @admin = create(:organization_membership, :admin, organization: @organization)
      @mail = described_class.join_via_guest_link(@organization_membership, @project, @admin.user).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders email" do
      assert_includes @html_body, @organization_membership.display_name
      assert_includes @html_body, @organization.name
      assert_includes @html_body, @project.name
      assert_includes @html_body, "via invitation link on Campsite"
    end
  end
end
