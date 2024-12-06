# frozen_string_literal: true

require "test_helper"

class ResourceMentionCollectionTest < ActiveSupport::TestCase
  context "initialization" do
    test "returns IDs for mentions" do
      mentioned_posts = create_list(:post, 4)
      mentioned_calls = create_list(:call, 3)
      mentioned_notes = create_list(:note, 2)

      mentioned_post_html = mentioned_posts.map { |post| "<resource-mention href=\"https://app.campsite.com/campsite/posts/#{post.public_id}\"></resource-mention>" }.join
      mentioned_call_html = mentioned_calls.map { |call| "<resource-mention href=\"https://app.campsite.com/campsite/calls/#{call.public_id}\"></resource-mention>" }.join
      mentioned_note_html = mentioned_notes.map { |note| "<resource-mention href=\"https://app.campsite.com/campsite/notes/#{note.public_id}\"></resource-mention>" }.join

      body = <<~HTML.strip
        #{mentioned_post_html}
        #{mentioned_call_html}
        #{mentioned_note_html}
      HTML

      result = ResourceMentionCollection.new(Nokogiri::HTML.fragment(body))

      assert_equal result.post_ids, mentioned_posts.pluck(:public_id)
      assert_equal result.call_ids, mentioned_calls.pluck(:public_id)
      assert_equal result.note_ids, mentioned_notes.pluck(:public_id)
    end
  end
end
