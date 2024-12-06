# frozen_string_literal: true

require "test_helper"

class UpdateProjectContributorsCountJobTest < ActiveJob::TestCase
  setup do
    @project = create(:project)
    @org = @project.organization
  end

  describe "#perform" do
    test "updates the project's contributors count" do
      create_list(:post, 3, project: @project)

      UpdateProjectContributorsCountJob.new.perform(@project.id)

      assert_equal 3, @project.reload.contributors_count
    end

    test "skips validations when updating contributors count" do
      create_list(:post, 3, project: @project)
      @project.organization.destroy!

      UpdateProjectContributorsCountJob.new.perform(@project.id)

      assert_equal 3, @project.reload.contributors_count
    end

    test "no-op if project no longer exists" do
      @project.destroy!

      assert_nothing_raised do
        UpdateProjectContributorsCountJob.new.perform(@project.id)
      end
    end

    test "does not count drafts" do
      create_list(:post, 3, :draft, project: @project)

      UpdateProjectContributorsCountJob.new.perform(@project.id)

      assert_equal 0, @project.reload.contributors_count
    end
  end
end
