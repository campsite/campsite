# frozen_string_literal: true

require "test_helper"

class PostLinkTest < ActiveSupport::TestCase
  context "#slack?" do
    test "returns true if link is a slack link" do
      link = create(:post_link, name: "slack")
      assert_predicate link, :slack?
    end

    test "returns false otherwise" do
      link = create(:post_link, name: "something-else")
      assert_not_predicate link, :slack?
    end
  end

  context "#slack_message_ts" do
    test "parses and returns the slack message ts from the url" do
      link = create(:post_link, name: :slack, url: "https://campsite-software.slack.com/archives/C03J9D4TQKS/p1234567890796459")
      assert "1234567890.796459", link.slack_message_ts
    end

    test "returns nil for a non slack url" do
      link = create(:post_link, name: :loom, url: "https://loom.com")
      assert_nil link.slack_message_ts
    end
  end

  context "#slack_channel_id" do
    test "parses and returns the slack channel id from the url" do
      link = create(:post_link, name: :slack, url: "https://campsite-software.slack.com/archives/C03J9D4TQKS/p1234567890796459")
      assert "C03J9D4TQKS", link.slack_channel_id
    end

    test "returns nil for a non slack url" do
      link = create(:post_link, name: :loom, url: "https://loom.com")
      assert_nil link.slack_channel_id
    end
  end

  context "#figma?" do
    test "returns true if link is a figma link" do
      link = create(:post_link, name: "figma")
      assert_predicate link, :figma?
    end

    test "returns false otherwise" do
      link = create(:post_link, name: "something-else")
      assert_not_predicate link, :figma?
    end
  end
end
