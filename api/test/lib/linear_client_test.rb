# frozen_string_literal: true

require "test_helper"

class LinearClientTest < ActiveSupport::TestCase
  describe "linear client" do
    it "accepts a graphql query and returns a response" do
      VCR.use_cassette("linear/success") do
        query = "{
          teams(first: 1) {
            nodes {
              name
            }
          }
        }"
        expected_json = {
          "data" => {
            "teams" => {
              "nodes" => [
                {
                  "name" => "Product engineer",
                },
              ],
            },
          },
        }
        client = LinearClient.new(Rails.application.credentials&.dig(:linear, :token))
        result = client.send({ query: query }.to_json).body
        assert_equal expected_json, result
      end
    end

    it "raises a ConnectionFailedError when the service is unavailable" do
      Faraday::Connection.any_instance.expects(:post).raises(Faraday::ConnectionFailed)
      assert_raises LinearClient::ConnectionFailedError do
        LinearClient.new(Rails.application.credentials&.dig(:linear, :token)).send("nope")
      end
    end

    it "raises an UnauthorizedEroor when auth token is incorrect" do
      VCR.use_cassette("linear/unauthorized") do
        assert_raises LinearClient::UnauthorizedError do
          LinearClient.new("bad-token").send({ query: "{ viewer { id } }" }.to_json)
        end
      end
    end

    it "raises a ServerError when server returns a 500" do
      VCR.use_cassette("linear/server_error") do
        assert_raises LinearClient::ServerError do
          LinearClient.new(Rails.application.credentials&.dig(:linear, :token)).send({ query: "{nope}" }.to_json)
        end
      end
    end
  end
end
