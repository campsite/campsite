# frozen_string_literal: true

require "test_helper"

class ThreadsImporterTest < ActiveSupport::TestCase
  describe "#run" do
    setup do
      @s3_prefix = "threads/channels_export"
      @s3_key = "#{@s3_prefix}/channels/34446292791/34454333877/thread.json"
      @organization = create(:organization_membership, :admin).organization
      S3_BUCKET.stubs(:objects).returns([stub(key: @s3_key)])
      S3_BUCKET.expects(:object).with("#{@s3_prefix}/channels.json")
        .returns(stub(get: stub(body: file_fixture("threads/channels_export/channels.json"))))
      S3_BUCKET.expects(:object).with("#{@s3_prefix}/users.json")
        .returns(stub(get: stub(body: file_fixture("threads/channels_export/users.json"))))
      ThreadsImporter.any_instance.stubs(:choice_prompt).returns("1")
      ThreadsImporter.any_instance.stubs(:open_prompt).returns("")
    end

    it "enqueues jobs to create posts" do
      ThreadsImporter.new(s3_prefix: @s3_prefix, organization_slug: @organization.slug).run
      assert_enqueued_sidekiq_jobs(21, only: ThreadsImporterPostCreationJob)
    end
  end
end
