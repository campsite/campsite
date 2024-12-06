# frozen_string_literal: true

require "test_helper"

class CreateProjectFromMessageThreadJobTest < ActiveJob::TestCase
  setup do
    @member = create(:organization_membership)
    @org = @member.organization
    @oauth_app = create(:oauth_application, owner: @org)
    @thread = create(:message_thread, :group, title: "Engineering", owner: @member, organization_memberships: [@member], oauth_applications: [@oauth_app])
    @favorite = create(:favorite, organization_membership: @member, favoritable: @thread)
  end

  describe "#perform" do
    test "creates a new project for the message thread" do
      assert_query_count 42 do
        assert_difference -> { Project.count }, 1 do
          CreateProjectFromMessageThreadJob.new.perform(@thread.id)
        end
      end

      project = @org.projects.last!
      assert_predicate project, :private?
      assert_equal @thread, project.message_thread
      assert_equal 1, project.members.count
      assert_includes project.members, @member
      assert_equal 1, project.oauth_applications.count
      assert_includes project.oauth_applications, @oauth_app
      assert_equal project, @favorite.reload.favoritable
    end
  end
end
