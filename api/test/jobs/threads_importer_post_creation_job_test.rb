# frozen_string_literal: true

require "test_helper"

class ThreadsImporterPostCreationJobTest < ActiveJob::TestCase
  context "#perform" do
    setup do
      @s3_prefix = "threads/channels_export"
      @s3_key = "#{@s3_prefix}/channels/34446292791/34454333877/thread.json"
      @organization = create(:organization)
      @project = create(:project, organization: @organization)
      create(:user_subscription, user: create(:organization_membership, organization: @organization).user, subscribable: @project)
      S3_BUCKET.expects(:object).with("#{@s3_prefix}/channels.json")
        .returns(stub(get: stub(body: file_fixture("threads/channels_export/channels.json"))))
      S3_BUCKET.expects(:object).with("#{@s3_prefix}/users.json")
        .returns(stub(get: stub(body: file_fixture("threads/channels_export/users.json"))))
      S3_BUCKET.expects(:object).with(@s3_key)
        .returns(stub(get: stub(body: file_fixture("threads/channels_export/channels/34446292791/34454333877/thread.json"))))
      S3_BUCKET.expects(:object).with("#{@s3_key.split("/")[0...-1].join("/")}/34454332363_5f0aefa5-4388-40c2-8799-f5a5fb5a6366.png")
        .returns(stub(copy_to: nil))
      StyledText.any_instance.stubs(:markdown_to_html).returns("<p>Some content</p>")
    end

    test "associates post with a new deactivated member if no user with matching email found" do
      assert_difference(-> { Post.count }, 1) do
        assert_difference -> { Comment.count }, 1 do
          assert_difference -> { Attachment.count }, 1 do
            assert_difference -> { User.count }, 1 do
              assert_difference -> { OrganizationMembership.count }, 1 do
                assert_no_difference -> { Notification.count } do
                  assert_no_enqueued_emails do
                    ThreadsImporterPostCreationJob.new.perform(@s3_prefix, @organization.slug, @s3_key, @project.id)
                    Event.all.each(&:process!)

                    post = Post.last!
                    assert_equal @project, post.project
                  end
                end
              end
            end
          end
        end
      end
    end

    test "associates post with existing member if one with matching email found" do
      member = create(:organization_membership, user: create(:user, email: "ryan@campsite.design"), organization: @organization)

      assert_difference(-> { Post.count }, 1) do
        assert_difference -> { Comment.count }, 1 do
          assert_difference -> { Attachment.count }, 1 do
            assert_no_difference -> { User.count } do
              assert_no_difference -> { OrganizationMembership.count } do
                assert_no_difference -> { Notification.count } do
                  assert_no_enqueued_emails do
                    ThreadsImporterPostCreationJob.new.perform(@s3_prefix, @organization.slug, @s3_key, @project.id)

                    post = Post.last!
                    assert_equal member, post.member
                  end
                end
              end
            end
          end
        end
      end
    end

    test "associates attachments with posts" do
      ThreadsImporterPostCreationJob.new.perform(@s3_prefix, @organization.slug, @s3_key, @project.id)

      post = Post.last!
      assert_equal 1, post.attachments.size
    end
  end
end
