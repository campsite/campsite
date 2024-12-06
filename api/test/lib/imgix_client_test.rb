# frozen_string_literal: true

require "test_helper"

class ImgixClientTest < ActiveSupport::TestCase
  setup do
    @client = ImgixClient.new(api_key: Rails.application.credentials.dig(:imgix, :api_key))
    @source_id = Rails.application.credentials.dig(:imgix, :source_id)
  end

  describe "#add_asset" do
    test "succeeds, returns an empty response" do
      VCR.use_cassette("imgix/add_asset") do
        result = @client.add_asset(source_id: @source_id, origin_path: "o/foklwviisxc1/p/6c6c54a9-e7ad-4a73-b990-62fd4f8a2e1c.png")
        assert_equal "", result
      end
    end

    test "no-op if asset already added" do
      VCR.use_cassette("imgix/add_asset_conflict") do
        result = @client.add_asset(source_id: @source_id, origin_path: "o/foklwviisxc1/p/6c6c54a9-e7ad-4a73-b990-62fd4f8a2e1c.png")
        assert_equal "", result
      end
    end
  end
end
