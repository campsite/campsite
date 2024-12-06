# frozen_string_literal: true

require "test_helper"

class OpenGraphLinkTest < ActiveSupport::TestCase
  context "#normalize_url" do
    test "returns nil for invalid URL" do
      assert_nil OpenGraphLink.normalize_url("gibberish")
    end

    test "returns nil for localhost" do
      assert_nil OpenGraphLink.normalize_url("http://localhost")
      assert_nil OpenGraphLink.normalize_url("http://localhost:3000")
      assert_nil OpenGraphLink.normalize_url("http://127.0.0.1")
    end

    test "returns normalized URL" do
      assert_equal "https://example.com", OpenGraphLink.normalize_url("http://example.com")
      assert_equal "https://example.com", OpenGraphLink.normalize_url("https://example.com")
      assert_equal "https://example.com", OpenGraphLink.normalize_url("https://example.com/")
      assert_equal "https://example.com/some/path", OpenGraphLink.normalize_url("https://example.com/some/path")
    end

    test "strips query params" do
      assert_equal "https://example.com", OpenGraphLink.normalize_url("https://example.com?utm_source=foo")
    end

    test "strips fragment" do
      assert_equal "https://example.com", OpenGraphLink.normalize_url("https://example.com#foo")
    end

    test "downcases host and not path" do
      assert_equal "https://example.com", OpenGraphLink.normalize_url("https://EXAMPLE.COM")
      assert_equal "https://example.com/SOME/PATH", OpenGraphLink.normalize_url("https://example.com/SOME/PATH")
    end
  end

  context "#safe_remote_url" do
    test "returns nil for invalid URL" do
      assert_nil OpenGraphLink.safe_remote_url("gibberish")
    end

    test "returns nil for url with spaces" do
      assert_nil OpenGraphLink.safe_remote_url("https://engage.sinch.comWhatsApp Updates - SE - Blog Title - 01.jpg")
    end
  end
end
