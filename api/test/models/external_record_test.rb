# frozen_string_literal: true

require "test_helper"

class ExternalRecordTest < ActiveSupport::TestCase
  describe "#referenceable" do
    it "detects campsite references" do
      post = create(:post)
      record = build(:external_record, metadata: {
        description: "Campsite post: [#{post.url}](#{post.url})",
      })

      assert_predicate record, :contains_campsite_references?
    end

    it "detects a post url in the description" do
      post = create(:post)
      record = create(:external_record, metadata: {
        description: "Campsite post: [#{post.url}](#{post.url})",
      })

      assert_equal [post.public_id], record.linked_post_ids
    end

    it "detects a comment url in the description" do
      comment = create(:comment)
      record = create(:external_record, metadata: {
        description: "Campsite comment: [#{comment.url}](#{comment.url})",
      })

      assert_equal [comment.public_id], record.linked_comment_ids
      assert_equal [], record.linked_post_ids
    end

    it "detects multiple post urls in the description" do
      posts = create_list(:post, 2)
      comment = create(:comment)

      record = create(:external_record, metadata: {
        description: "Campsite posts: [#{posts[0].url}](#{posts[0].url}) & [#{posts[1].url}](#{posts[1].url}) and a comment [#{comment.url}](#{comment.url})",
      })

      assert_equal [posts[0].public_id, posts[1].public_id], record.linked_post_ids
      assert_equal [comment.public_id], record.linked_comment_ids
    end

    it "ignores duplicate urls in the description" do
      post = create(:post)
      record = create(:external_record, metadata: {
        description: "Campsite post: [#{post.url}](#{post.url}) [#{post.url}](#{post.url})",
      })

      assert_equal [post.public_id], record.linked_post_ids
    end

    it "works for missing description" do
      record = create(:external_record)
      assert_equal [], record.linked_post_ids
    end
  end

  describe "#timeline_events" do
    it "creates a timeline event for each post reference" do
      post = create(:post)
      record = create(:external_record, metadata: {
        description: "Campsite post: [#{post.url}](#{post.url})",
      })

      record.create_post_references

      assert_equal 1, record.timeline_events.count

      event = record.timeline_events.first

      assert_equal post.id, event.subject_id
      assert_equal record.id, event.reference_id
    end
  end
end
