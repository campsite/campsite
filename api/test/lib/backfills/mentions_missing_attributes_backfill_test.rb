# frozen_string_literal: true

require "test_helper"

module Backfills
  class MentionsMissingAttributesBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "updates old mentions" do
        member = create(:organization_membership, user: create(:user, username: "brian", name: "Brian Lovin"))

        hit_html = <<~HTML
          <p><strong>GitHub integration: Let's try it out!</strong></p>
          <p>Yo yo <span class="mention">@Brian Lovin</span> what's up?</p>
        HTML
        miss_html = <<~HTML
          <p><strong>GitHub integration: Let's try it out!</strong></p>
          <p>Yo yo <a href="https://foo.com">@Brian Lovin</a> what's up?</p>
        HTML

        post_hit = create(:post, description_html: hit_html, member: member, organization: member.organization)
        post_miss = create(:post, description_html: miss_html, member: member, organization: member.organization)
        comment_hit = create(:comment, body_html: hit_html, subject: post_hit, member: member)
        comment_miss = create(:comment, body_html: miss_html, subject: post_miss, member: member)
        note_hit = create(:note, description_html: hit_html, member: member)
        note_miss = create(:note, description_html: miss_html, member: member)

        MentionsMissingAttributesBackfill.run(dry_run: false)

        [post_hit, post_miss, comment_hit, comment_miss, note_hit, note_miss].each(&:reload)

        fixed_html = <<~HTML
          <p><strong>GitHub integration: Let's try it out!</strong></p>
          <p>Yo yo <span class="mention" data-type="mention" data-id="#{member.public_id}" data-label="Brian Lovin" data-username="brian">@Brian Lovin</span> what's up?</p>
        HTML

        assert_equal fixed_html, post_hit.description_html
        assert_equal miss_html, post_miss.description_html
        assert_equal fixed_html, comment_hit.body_html
        assert_equal miss_html, comment_miss.body_html
        assert_equal fixed_html, note_hit.description_html
        assert_equal miss_html, note_miss.description_html
      end

      it "dry run noops" do
        member = create(:organization_membership, user: create(:user, username: "brian", name: "Brian Lovin"))

        hit_html = <<~HTML
          <p><strong>GitHub integration: Let's try it out!</strong></p>
          <p>Yo yo <span class="mention">@Brian Lovin</span> what's up?</p>
        HTML
        miss_html = <<~HTML
          <p><strong>GitHub integration: Let's try it out!</strong></p>
          <p>Yo yo <a href="https://foo.com">@Brian Lovin</a> what's up?</p>
        HTML

        post_hit = create(:post, description_html: hit_html, member: member, organization: member.organization)
        post_miss = create(:post, description_html: miss_html, member: member, organization: member.organization)
        comment_hit = create(:comment, body_html: hit_html, subject: post_hit, member: member)
        comment_miss = create(:comment, body_html: miss_html, subject: post_miss, member: member)
        note_hit = create(:note, description_html: hit_html, member: member)
        note_miss = create(:note, description_html: miss_html, member: member)

        MentionsMissingAttributesBackfill.run(dry_run: true)

        [post_hit, post_miss, comment_hit, comment_miss, note_hit, note_miss].each(&:reload)

        assert_equal hit_html, post_hit.description_html
        assert_equal miss_html, post_miss.description_html
        assert_equal hit_html, comment_hit.body_html
        assert_equal miss_html, comment_miss.body_html
        assert_equal hit_html, note_hit.description_html
        assert_equal miss_html, note_miss.description_html
      end
    end
  end
end
