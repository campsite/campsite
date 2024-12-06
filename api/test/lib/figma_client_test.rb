# frozen_string_literal: true

require "test_helper"

class FigmaClientTest < ActiveSupport::TestCase
  setup do
    @client = FigmaClient.new(Rails.application.credentials.dig(:figma, :test_oauth_token))
    @team_id = "1108886166368239668"
    @file_key = "LatexK446J8mGtPFbySaOe"
    @node_id = "1:2"
  end

  describe "#me" do
    test "returns a Figma::User" do
      VCR.use_cassette("figma/me") do
        me = @client.me

        assert_equal "Nick Holden", me.handle
        assert_equal "nick@campsite.design", me.email
        assert_predicate me.img_url, :present?
        assert_predicate me.id, :present?
      end
    end
  end

  describe "#file" do
    test "returns a Figma::File" do
      VCR.use_cassette("figma/file") do
        file = @client.file(@file_key)

        assert_equal "Untitled (Copy) (Copy)", file.name
        assert_equal "0:1", file.first_page_id
      end
    end
  end

  describe "#file_nodes" do
    test "returns a Figma::File" do
      VCR.use_cassette("figma/file_nodes") do
        file = @client.file_nodes(file_key: @file_key, node_ids: [@node_id])

        assert_equal "Untitled (Copy) (Copy)", file.name
        assert_equal 1, file.nodes.length
        assert_equal @node_id, file.nodes.first.id
        assert_equal 892, file.nodes.first.width
      end
    end
  end

  describe "#image" do
    test "returns a URL" do
      VCR.use_cassette("figma/image") do
        response = @client.image(file_key: @file_key, node_id: @node_id, scale: 2, format: "png")

        assert_includes response, "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/"
      end
    end
  end
end
