# frozen_string_literal: true

require "test_helper"

class CreateDemoContentJobTest < ActiveJob::TestCase
  context "perform" do
    setup do
      @organization = DemoOrgs::Generator.new.organization
    end

    test "creates demo content" do
      DemoOrgs::Generator.any_instance.expects(:update_content)

      CreateDemoContentJob.new.perform(@organization.slug)
    end
  end
end
