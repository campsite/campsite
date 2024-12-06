# frozen_string_literal: true

require "test_helper"

class SlackBlockKitTest < ActiveSupport::TestCase
  describe ".mrkdwn_link" do
    it "correctly escapes reserved characters" do
      text = "This is a & < > | test"
      escaped_text = "This is a &amp; &lt; &gt; | test"
      url = "https://campsite.com?<=|&>=|"
      escaped_url = "https://campsite.com?&lt;=%7C&amp;&gt;=%7C"

      assert_equal "<#{escaped_url}|#{escaped_text}>", SlackBlockKit.mrkdwn_link(text: text, url: url)
    end

    it "gracefully handles nil text" do
      assert_equal "<https://campsite.com|https://campsite.com>", SlackBlockKit.mrkdwn_link(text: nil, url: "https://campsite.com")
    end
  end
end
