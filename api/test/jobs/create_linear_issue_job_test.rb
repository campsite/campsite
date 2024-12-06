# frozen_string_literal: true

require "test_helper"

class CreateLinearIssueJobTest < ActiveJob::TestCase
  setup do
    @post = create(:post)
    @integration = create(:integration, :linear, owner: @post.organization)
    @issue_data = { title: "Test title", description: "Test description", team_id: "f032f417-c15a-4b9b-b82c-d4e880b1c396" }
  end

  context "perform" do
    context "post" do
      test "triggers a pusher event on success for posts" do
        Pusher.expects(:trigger)

        VCR.use_cassette("linear/create_issue") do
          assert_difference -> { TimelineEvent.count }, 1 do
            CreateLinearIssueJob.new.perform(@issue_data.to_json, "Post", @post.public_id, @post.member.id)
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "timeline-events-stale", nil.to_json])
          end
        end
      end

      test "triggers a pusher event on success for comments" do
        comment = create(:comment, subject: @post)

        Pusher.expects(:trigger)

        VCR.use_cassette("linear/create_issue") do
          assert_difference -> { TimelineEvent.count }, 1 do
            CreateLinearIssueJob.new.perform(@issue_data.to_json, "Comment", comment.public_id, @post.member.id)
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "comments-stale", {
              post_id: @post.public_id,
              subject_id: @post.public_id,
              user_id: comment.member.user.public_id,
              attachment_id: nil,
            }.to_json,])
          end
        end
      end

      test "successfully creates Linear attachments with subtitles containing double quotes" do
        @post.update!(description_html: "\"test\"")
        Sentry.expects(:capture_exception).never

        VCR.use_cassette("linear/create_issue_with_double_quote_attachment_subtitle") do
          assert_difference -> { TimelineEvent.count }, 1 do
            CreateLinearIssueJob.new.perform(@issue_data.to_json, "Post", @post.public_id, @post.member.id)
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "timeline-events-stale", nil.to_json])
          end
        end
      end

      test "successfully creates Linear attachments for posts with nil display_titles" do
        @post.update!(title: nil, description_html: nil)

        issue_id = "test-issue-id"
        LinearClient::Issues.any_instance.stubs(:create).returns({ "id" => issue_id, "url" => "https://foobar", "identifier" => "CAM-123", "state" => "1", "title" => @issue_data[:title] })
        LinearClient::Attachments.any_instance.expects(:create).with(issue_id: issue_id, title: "Campsite post", subtitle: "", url: @post.url)

        CreateLinearIssueJob.new.perform(@issue_data.to_json, "Post", @post.public_id, @post.member.id)
      end

      test "successfully creates Linear attachments for comments on posts with nil display_titles" do
        @post.update!(title: nil, description_html: nil)
        comment = create(:comment, subject: @post)

        issue_id = "test-issue-id"
        LinearClient::Issues.any_instance.stubs(:create).returns({ "id" => issue_id, "url" => "https://foobar", "identifier" => "CAM-123", "state" => "1", "title" => @issue_data[:title] })
        LinearClient::Attachments.any_instance.expects(:create).with(issue_id: issue_id, title: "Campsite comment", subtitle: comment.plain_body_text, url: comment.url)

        CreateLinearIssueJob.new.perform(@issue_data.to_json, "Comment", comment.public_id, comment.member.id)
      end

      test "creates Linear attachments for comments" do
        comment = create(:comment, subject: @post)
        Sentry.expects(:capture_exception).never

        VCR.use_cassette("linear/create_issue_from_comment") do
          CreateLinearIssueJob.new.perform(@issue_data.to_json, "Comment", comment.public_id, comment.member.id)
        end
      end

      test "trims Linear attachment subtitle below or equal to 2048 characters" do
        comment = create(:comment, subject: @post, body_html: "a" * 5000)
        Sentry.expects(:capture_exception).never

        VCR.use_cassette("linear/create_issue_from_long_comment") do
          CreateLinearIssueJob.new.perform(@issue_data.to_json, "Comment", comment.public_id, comment.member.id)
        end
      end
    end
  end
end
