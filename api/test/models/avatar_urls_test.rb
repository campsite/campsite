# frozen_string_literal: true

require "test_helper"

class AvatarUrlsTest < ActiveSupport::TestCase
  test "returns an array of imgix size urls for a relative path" do
    urls = AvatarUrls.new(avatar_path: "o/dev-seed-files/forest_org_icon.png", display_name: "Frontier Forest").urls

    assert_equal dev_avatar_path(20), urls[:xs]
    assert_equal dev_avatar_path(24), urls[:sm]
    assert_equal dev_avatar_path(32), urls[:base]
    assert_equal dev_avatar_path(40), urls[:lg]
    assert_equal dev_avatar_path(64), urls[:xl]
    assert_equal dev_avatar_path(112), urls[:xxl]
  end

  test "returns an absolute url for a remote path" do
    path = "http://example.com/forest_org_icon.png"
    url = AvatarUrls.new(avatar_path: path).url(size: 40)

    assert_equal path, url
  end

  test "returns a fallback avatar url for a blank path" do
    url = AvatarUrls.new(display_name: "Frontier Forest").url(size: 40)

    assert_match(%r{http://campsite-test.imgix.net/static/avatars/F.png\?blend-color=\h{6}&fit=crop&h=80&w=80}, url)
  end

  private

  def dev_avatar_path(size)
    retina_size = size * 2

    "http://campsite-test.imgix.net/o/dev-seed-files/forest_org_icon.png?fit=crop&h=#{retina_size}&w=#{retina_size}"
  end
end
