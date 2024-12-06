# frozen_string_literal: true

require "test_helper"

class TenorClientTest < ActiveSupport::TestCase
  setup do
    @client ||= TenorClient.new(api_key: Rails.application.credentials.tenor.api_key)
  end

  describe "#search" do
    test "returns search results" do
      VCR.use_cassette("tenor/search") do
        result = @client.search(query: "grogu", limit: 10)
        assert_equal 10, result.data.count
        assert_predicate result.next_cursor, :present?
      end
    end

    test "returns featured results" do
      VCR.use_cassette("tenor/featured") do
        result = @client.featured(limit: 10)
        assert_equal 10, result.data.count
        assert_predicate result.next_cursor, :present?
      end
    end

    test "escapes special characters in query" do
      VCR.use_cassette("tenor/search_special_characters") do
        result = @client.search(query: "Let’s get down to business", limit: 10)
        assert_equal 10, result.data.count
        assert_predicate result.next_cursor, :present?
      end
    end
  end
end
