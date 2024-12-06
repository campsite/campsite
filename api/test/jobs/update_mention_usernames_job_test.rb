# frozen_string_literal: true

require "test_helper"

class UpdateMentionUsernamesJobTest < ActiveJob::TestCase
  context "perform" do
    test "updates posts" do
      member = create(:organization_membership, user: create(:user, username: "old_username", name: "Old Name"))
      post = create(:post, description_html: "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"Old Name\">@Old Name</span>", organization: member.organization)

      member.user.update!(name: "New Name")
      UpdateMentionUsernamesJob.new.perform(member.user.id)

      assert_equal "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span>", post.reload.description_html
    end

    test "updates comments" do
      member = create(:organization_membership, user: create(:user, username: "old_username", name: "Old Name"))
      comment = create(
        :comment,
        body_html: "<p>foo bar baz <span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"Old Name\">@Old Name</span></p>",
        subject: create(:post, organization: member.organization),
      )

      member.user.update!(name: "New Name")
      UpdateMentionUsernamesJob.new.perform(member.user.id)

      assert_equal "<p>foo bar baz <span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", comment.reload.body_html
    end

    test "updates notes" do
      member = create(:organization_membership, user: create(:user, username: "old_username", name: "Old Name"))
      note = create(:note, description_html: "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"Old Name\">@Old Name</span>", member: member)

      member.user.update!(name: "New Name")
      UpdateMentionUsernamesJob.new.perform(member.user.id)

      assert_equal "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span>", note.reload.description_html
    end

    test "updates multiple mentions" do
      member = create(:organization_membership, user: create(:user, username: "old_username", name: "Old Name"))

      old_mention = "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"Old Name\">@Old Name</span>"

      post = create(:post, description_html: "<p>foo bar #{old_mention} and #{old_mention}</p>", organization: member.organization)

      member.user.update!(name: "New Name")
      UpdateMentionUsernamesJob.new.perform(member.user.id)

      new_mention = "<span data-type=\"mention\" class=\"mention\" data-id=\"#{member.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span>"

      assert_equal "<p>foo bar #{new_mention} and #{new_mention}</p>", post.reload.description_html
    end
  end
end
