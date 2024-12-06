# frozen_string_literal: true

require "test_helper"

class PostLinkPreviewTest < ActiveSupport::TestCase
  context "service_name" do
    test "downcases service name before saving" do
      link = create(:post_link_preview, service_name: "CampSite")
      assert_equal "campsite", link.service_name
    end
  end
end
