# frozen_string_literal: true

require "test_helper"

module Backfills
  class MentionsUsernameToNameBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "updates posts" do
        member1 = create(:organization_membership, user: create(:user, username: "old_username", name: "New Name"))
        post1 = create(:post, member: member1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>")

        member2 = create(:organization_membership, user: create(:user, username: "foo_bar", name: "Foo Bar"))
        post2 = create(:post, member: member2, description_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>")

        no_mention = create(:post, description_html: "<p>no mention</p>")

        MentionsUsernameToNameBackfill.run(dry_run: false)

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", post1.reload.description_html
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"Foo Bar\" data-username=\"foo_bar\">@Foo Bar</span></p>", post2.reload.description_html
        assert_equal "<p>no mention</p>", no_mention.reload.description_html
      end

      it "updates comments" do
        member1 = create(:organization_membership, user: create(:user, username: "old_username", name: "New Name"))
        comment1 = create(:comment, member: member1, body_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>")

        member2 = create(:organization_membership, user: create(:user, username: "foo_bar", name: "Foo Bar"))
        comment2 = create(:comment, member: member2, body_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>")

        no_mention = create(:comment, body_html: "<p>no mention</p>")

        MentionsUsernameToNameBackfill.run(dry_run: false)

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", comment1.reload.body_html
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"Foo Bar\" data-username=\"foo_bar\">@Foo Bar</span></p>", comment2.reload.body_html
        assert_equal "<p>no mention</p>", no_mention.reload.body_html
      end

      it "updates notes" do
        member1 = create(:organization_membership, user: create(:user, username: "old_username", name: "New Name"))
        note1 = create(:note, member: member1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>", description_state: "old state")

        member2 = create(:organization_membership, user: create(:user, username: "foo_bar", name: "Foo Bar"))
        note2 = create(:note, member: member2, description_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>", description_state: "old state")

        no_mention = create(:note, description_html: "<p>no mention</p>", description_state: "old state")

        MentionsUsernameToNameBackfill.run(dry_run: false)

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", note1.reload.description_html
        assert_nil note1.description_state
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"Foo Bar\" data-username=\"foo_bar\">@Foo Bar</span></p>", note2.reload.description_html
        assert_nil note2.description_state
        assert_equal "<p>no mention</p>", no_mention.reload.description_html
        assert_not_nil no_mention.description_state
      end

      it "updates only org slug" do
        org1 = create(:organization, slug: "foo-bar")
        member1 = create(:organization_membership, organization: org1, user: create(:user, username: "old_username", name: "New Name"))
        post1 = create(:post, member: member1, organization: org1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>")
        comment1 = create(:comment, member: member1, body_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>")
        note1 = create(:note, member: member1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>", description_state: "old state")

        org2 = create(:organization, slug: "cat-dog")
        member2 = create(:organization_membership, organization: org2, user: create(:user, username: "older_username", name: "New Name"))
        post2 = create(:post, member: member2, organization: org2, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"older_username\">@older_username</span></p>")
        comment2 = create(:comment, member: member2, body_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>")
        note2 = create(:note, member: member2, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"older_username\">@older_username</span></p>", description_state: "old state")

        MentionsUsernameToNameBackfill.run(dry_run: false, organization_slug: "foo-bar")

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", post1.reload.description_html
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", comment1.reload.body_html
        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"New Name\" data-username=\"old_username\">@New Name</span></p>", note1.reload.description_html

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"older_username\">@older_username</span></p>", post2.reload.description_html
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>", comment2.reload.body_html
        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member2.public_id}\" data-label=\"older_username\">@older_username</span></p>", note2.reload.description_html
      end

      it "skips updates during dry run" do
        member1 = create(:organization_membership, user: create(:user, username: "old_username", name: "New Name"))
        post1 = create(:post, member: member1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>")
        comment1 = create(:comment, member: member1, body_html: "<p>hi <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>")
        note1 = create(:note, member: member1, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>", description_state: "old state")

        MentionsUsernameToNameBackfill.run(dry_run: true)

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>", post1.reload.description_html
        assert_equal "<p>hi <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"foo_bar\">@foo_bar</span></p>", comment1.reload.body_html
        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{member1.public_id}\" data-label=\"old_username\">@old_username</span></p>", note1.reload.description_html
      end

      it "handles deleted members" do
        member = create(:organization_membership, user: create(:user, username: "old_username", name: "New Name"))
        public_id = member.public_id
        post = create(:post, member: member, description_html: "<p>hello <span data-type=\"mention\" data-id=\"#{public_id}\" data-label=\"old_username\">@old_username</span></p>")
        member.destroy

        MentionsUsernameToNameBackfill.run(dry_run: false)

        assert_equal "<p>hello <span data-type=\"mention\" data-id=\"#{public_id}\" data-label=\"old_username\">@old_username</span></p>", post.reload.description_html
      end
    end
  end
end
