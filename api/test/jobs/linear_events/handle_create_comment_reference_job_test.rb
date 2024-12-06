# frozen_string_literal: true

require "test_helper"

module LinearEvents
  class HandleCreateCommentReferenceJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("linear/comment_create.json").read)
    end

    context "perform" do
      setup do
        @integration_org = create(:linear_organization_id, value: "linear-org-id")
        @integration = @integration_org.integration
        @organization = @integration.owner

        @params["organizationId"] = @integration_org.value
        @post = create(:post, organization: @organization)

        @linear_external_record = create(:external_record, :linear_issue)
        @params["data"]["issueId"] = @linear_external_record.remote_record_id
        @params["data"]["issue"]["id"] = @linear_external_record.remote_record_id
      end

      test "creates an ExternalRecord from a post mention" do
        @params["data"]["body"] = "Campsite post: [#{@post.url}](#{@post.url})"

        VCR.use_cassette("linear/issue") do
          assert_difference -> { ExternalRecord.count }, 1 do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end

        record = ExternalRecord.last

        assert_equal "linear", record.service
        assert_equal @params["data"]["id"], record.remote_record_id
        assert_equal "#{@params["data"]["issue"]["title"]} (Comment)", record.remote_record_title
        assert_equal record.timeline_events.count, 1
      end

      test "creates one ExternalRecord from multiple mentions of the same post" do
        @params["data"]["body"] = "Campsite post: [#{@post.url}](#{@post.url}) and the [same post again](#{@post.url})"

        VCR.use_cassette("linear/issue") do
          assert_difference -> { ExternalRecord.count }, 1 do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end

        record = ExternalRecord.last

        assert_equal "linear", record.service
        assert_equal @params["data"]["id"], record.remote_record_id
        assert_equal "#{@params["data"]["issue"]["title"]} (Comment)", record.remote_record_title
        assert_equal record.timeline_events.count, 1
      end

      test "doesn't create a post reference for a comment url" do
        comment = create(:comment, subject: @post)

        @params["data"]["description"] = "Campsite comment: [#{comment.url}](#{comment.url})"

        VCR.use_cassette("linear/issue") do
          assert_no_difference -> { ExternalRecord.count } do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end

        assert_equal 0, TimelineEvent.count
      end

      test "ignores references in a comment from a different org than the one who owns the post" do
        issue_owner = create(:linear_organization_id, value: "org2")

        post_owned_by_another_org = @post

        @params["organizationId"] = issue_owner.value
        @params["data"]["body"] = "Campsite post: [#{post_owned_by_another_org.url}](#{post_owned_by_another_org.url})"

        VCR.use_cassette("linear/issue") do
          assert_no_difference -> { ExternalRecord.count } do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end
      end

      test "handles references in an org with multiple active integrations" do
        integration_org_2 = create(:linear_organization_id, value: "linear-org-id") # same Linear org, different Campsite org
        post_2 = create(:post, organization: integration_org_2.integration.owner)

        # issue contains links to two posts in two different orgs; both orgs have a Linear integration with the same Linear org
        @params["data"]["body"] = "Campsite posts: [#{@post.url}](#{@post.url}) and [#{post_2.url}](#{post_2.url})"

        VCR.use_cassette("linear/issue") do
          assert_difference -> { ExternalRecord.count }, 1 do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end

        assert_equal 2, TimelineEvent.count
      end

      test "upserts an ExternalRecord that already exists" do
        external_record = create(:external_record, service: "linear", remote_record_id: "linear-issue-uuid")

        @params["data"]["id"] = external_record.remote_record_id
        @params["data"]["body"] = "Campsite post: [#{@post.url}](#{@post.url})"

        assert_equal 2, ExternalRecord.count

        VCR.use_cassette("linear/issue") do
          assert_no_difference -> { ExternalRecord.count } do
            HandleCreateCommentReferenceJob.new.perform(@params.to_json)
          end
        end
      end
    end
  end
end
