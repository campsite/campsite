# frozen_string_literal: true

require "test_helper"

module Backfills
  class PostAuthorViewBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "insert views for posts without author views" do
        post1 = create(:post)
        post2 = create(:post)
        post3 = create(:post)
        post4 = create(:post)

        create(:post_view, post: post1, member: post1.member)
        create(:post_view, post: post2, member: create(:organization_membership, organization: post2.organization))
        create(:post_view, post: post4, member: post4.member)
        create(:post_view, post: post4, member: create(:organization_membership, organization: post4.organization))

        assert_equal 1, post1.views.count
        assert_equal 1, post2.views.count
        assert_equal 0, post3.views.count
        assert_equal 2, post4.views.count

        PostAuthorViewBackfill.run(dry_run: false)

        assert_equal 1, post1.views.count
        assert_equal 2, post2.views.count
        assert_equal 1, post3.views.count
        assert_equal 2, post4.views.count
      end
    end
  end
end
