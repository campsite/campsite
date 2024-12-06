# frozen_string_literal: true

require "test_helper"

module LinearEvents
  class HandleIssueCreateReferenceJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("linear/issue_create.json").read)
    end

    context "perform" do
      setup do
        @integration_org = create(:linear_organization_id, value: "linear-org-id")
        @integration = @integration_org.integration
        @organization = @integration.owner

        @params["organizationId"] = @integration_org.value
        @post = create(:post, organization: @organization)
      end

      test "creates an ExternalRecord from a post mention" do
        @params["data"]["description"] = "Campsite post: [#{@post.url}](#{@post.url})"

        assert_difference -> { ExternalRecord.count }, 1 do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end

        record = ExternalRecord.last

        assert_equal "linear", record.service
        assert_equal @params["data"]["id"], record.remote_record_id
        assert_equal @params["data"]["title"], record.remote_record_title
        assert_equal @params["data"]["identifier"], record.metadata.dig("identifier")
        assert_equal record.timeline_events.count, 1
      end

      test "creates one ExternalRecord from multiple mentions of the same post" do
        @params["data"]["description"] = "Campsite post: [#{@post.url}](#{@post.url}) and the [same post again](#{@post.url})"

        assert_difference -> { ExternalRecord.count }, 1 do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end

        record = ExternalRecord.last

        assert_equal "linear", record.service
        assert_equal @params["data"]["id"], record.remote_record_id
        assert_equal @params["data"]["title"], record.remote_record_title
        assert_equal @params["data"]["identifier"], record.metadata.dig("identifier")
        assert_equal record.timeline_events.count, 1
      end

      test "doesn't create a post reference for a comment url" do
        comment = create(:comment, subject: @post)

        @params["data"]["description"] = "Campsite comment: [#{comment.url}](#{comment.url})"

        assert_no_difference -> { ExternalRecord.count } do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end

        assert_equal 0, TimelineEvent.count
      end

      test "ignores references in an issue in a private team" do
        @params["data"]["team"]["private"] = true

        assert_no_difference -> { ExternalRecord.count } do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end

        assert_equal 0, TimelineEvent.count
      end

      test "does not create post reference if the issue that referenced the post was created from that post" do
        # external record already exists because someone created an issue from the post
        external_record = create(:external_record, service: "linear", remote_record_id: @params["data"]["id"], remote_record_title: @params["data"]["title"])
        create(:timeline_event, action: "created_linear_issue_from_post", subject: @post, reference: external_record)

        @params["data"]["description"] = "Campsite post: [#{@post.url}](#{@post.url})"

        assert_no_difference -> { TimelineEvent.count } do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end
      end

      test "ignores references in an issue from a different org than the one who owns the post" do
        issue_owner = create(:linear_organization_id, value: "org2")

        post_owned_by_another_org = @post

        @params["organizationId"] = issue_owner.value
        @params["data"]["description"] = "Campsite post: [#{post_owned_by_another_org.url}](#{post_owned_by_another_org.url})"

        assert_no_difference -> { ExternalRecord.count } do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end
      end

      test "handles references in an org with multiple active integrations" do
        integration_org_2 = create(:linear_organization_id, value: "linear-org-id") # same Linear org, different Campsite org
        post_2 = create(:post, organization: integration_org_2.integration.owner)

        # issue contains links to two posts in two different orgs; both orgs have a Linear integration with the same Linear org
        @params["data"]["description"] = "Campsite posts: [#{@post.url}](#{@post.url}) and [#{post_2.url}](#{post_2.url})"

        assert_difference -> { ExternalRecord.count }, 1 do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end

        assert_equal 2, TimelineEvent.count
      end

      test "upserts an ExternalRecord that already exists" do
        external_record = create(:external_record, service: "linear", remote_record_id: "linear-issue-uuid")

        @params["data"]["id"] = external_record.remote_record_id
        @params["data"]["description"] = "Campsite post: [#{@post.url}](#{@post.url})"

        assert_equal 1, ExternalRecord.count

        assert_no_difference -> { ExternalRecord.count } do
          HandleCreateIssueReferenceJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
