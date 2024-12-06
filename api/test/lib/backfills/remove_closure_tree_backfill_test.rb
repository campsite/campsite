# frozen_string_literal: true

require "test_helper"

module Backfills
  class RemoveClosureTreeBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "sets post_parent_id for any post" do
        parent = create(:post)
        discarded_iteration = create(:post, :discarded, parent_id: parent.id)
        child = create(:post, parent_id: parent.id)

        RemoveClosureTreeBackfill.run(dry_run: false)

        parent.reload
        child.reload
        discarded_iteration.reload
        assert_equal parent.id, child.post_parent_id
        assert_equal parent.id, discarded_iteration.post_parent_id
        assert_equal parent.child_id, child.id
        assert_predicate parent, :stale
      end

      it "dry run is a no-op" do
        parent = create(:post)
        child = create(:post, parent_id: parent.id)
        discarded_iteration = create(:post, :discarded, parent_id: parent.id)

        RemoveClosureTreeBackfill.run

        child.reload
        discarded_iteration.reload
        assert_nil child.post_parent_id
        assert_nil discarded_iteration.post_parent_id
      end

      it "sets root_id for any post" do
        parent = create(:post)
        child = create(:post, parent_id: parent.id)
        grandchild = create(:post, parent_id: child.id)
        discarded_iteration = create(:post, :discarded, parent_id: parent.id)

        RemoveClosureTreeBackfill.run(dry_run: false)

        child.reload
        grandchild.reload
        discarded_iteration.reload
        assert_equal parent.id, child.root_id
        assert_equal parent.id, grandchild.root_id
        assert_equal parent.id, discarded_iteration.root_id
      end
    end
  end
end
