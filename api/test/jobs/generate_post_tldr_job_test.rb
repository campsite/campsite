# frozen_string_literal: true

require "test_helper"

class GeneratePostTldrJobTest < ActiveJob::TestCase
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

        VCR.use_cassette("jobs/generated_tldr") do
          assert_difference -> { LlmResponse.count }, 1 do
            GeneratePostTldrJob.new.perform(@post.public_id, @member.id)
          end
        end
      end

      test "replaces mentions with html" do
        # hardcode the public_id for recorded
        @member.update_column(:public_id, "0123456789ab")
        @member.user.update_columns(username: "username", name: "User Name")
        Current.expects(:pusher_socket_id).returns("123.456")
        Pusher.expects(:trigger)
        Llm.any_instance.stubs(:chat).returns("<@#{@member.public_id}> should have pancakes.")

        VCR.use_cassette("jobs/generated_tldr_mention") do
          GeneratePostTldrJob.new.perform(@post.public_id, @member.id)
        end

        expected = <<~HTML.squish
          <p><span class="mention" data-type="mention" data-id="#{@member.public_id}" data-label="User Name" data-username="username">@User Name</span>
            should have pancakes.</p>
        HTML

        assert_equal expected, LlmResponse.last.response
      end
    end
  end
end
