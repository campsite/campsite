# frozen_string_literal: true

require "test_helper"

class GeneratePostResolutionJobTest < ActiveJob::TestCase
  setup do
    @post = create(:post, description_html: "<p>What should I eat for breakfast?</p>")
    @member = create(:organization_membership, organization: @post.organization)

    comment1 = create(:comment, subject: @post, body_html: "<p>I definitely think you should have pancakes.</p>")
    create(:comment, subject: @post, parent: comment1, body_html: "<p>I totally agree, pancakes sound delicious!</p>")
    @comment2 = create(:comment, subject: @post, body_html: "<p>I think you should have cereal.</p>")
    create(:comment, subject: @post, parent: @comment2, body_html: "<p>Nah, I think you should have pancakes.</p>")
    create(:comment, member: @post.member, subject: @post, body_html: "<p>Pancakes it is!</p>")
  end

  context "perform" do
    context "post" do
      test "triggers a pusher event on success" do
        Current.expects(:pusher_socket_id).returns("123.456")
        Pusher.expects(:trigger)

        VCR.use_cassette("jobs/generated_resolution") do
          assert_difference -> { LlmResponse.count }, 1 do
            GeneratePostResolutionJob.new.perform(@post.public_id, @member.id)
          end
        end
      end
    end

    context "comment" do
      test "triggers a pusher event on success" do
        Current.expects(:pusher_socket_id).returns("123.456")
        Pusher.expects(:trigger)

        VCR.use_cassette("jobs/generated_resolution_comment") do
          assert_difference -> { LlmResponse.count }, 1 do
            GeneratePostResolutionJob.new.perform(@post.public_id, @member.id, @comment2.public_id)
          end
        end
      end
    end
  end
end
