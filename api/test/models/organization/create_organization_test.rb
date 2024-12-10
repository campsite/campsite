# frozen_string_literal: true

require "test_helper"

class Organization
  class CreateOrganizationTest < ActiveSupport::TestCase
    setup do
      @user = create(:user)
    end

    test "creates an org with a name" do
      Timecop.freeze do
        org = Organization::CreateOrganization.new(creator: @user, name: "Foo bar", slug: "foobar").run

        org.reload

        assert_empty org.errors
        assert_predicate org, :persisted?
        assert_equal "Foo bar", org.name
        assert_equal @user, org.creator
        assert_equal Plan::PRO_NAME, org.plan_name
        assert_predicate org.campsite_integration, :present?
      end
    end

    test "creates default projects when the org is created" do
      org = Organization::CreateOrganization.new(creator: @user, name: "Foo bar", slug: "foobar").run

      assert_equal org.projects.where(is_default: true).length, Project::ORG_DEFAULT_PROJECTS.length

      org.projects.each do |project|
        assert_equal 1, project.project_memberships.length
        project_membership = project.project_memberships.first!
        assert_equal @user, project_membership.organization_membership.user
        assert project.subscribers.include?(@user)

        event = project_membership.events.created_action.first!
        assert_predicate event, :skip_notifications?
        assert_no_difference -> { Notification.count } do
          event.process!
        end
      end
    end

    test "creates default tags when the org is created" do
      org = Organization::CreateOrganization.new(creator: @user, name: "Foo bar", slug: "foobar").run

      assert_equal Tag::ORG_DEFAULT_TAGS.length, org.tags.length
    end
  end
end
