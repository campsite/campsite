# frozen_string_literal: true

require "test_helper"

class HtmlToImageTest < ActiveSupport::TestCase
  describe "#image" do
    it "accepts html and returns an image" do
      html = <<~HTML.strip
        <h1>Heading</h1>
        <p>Reprehenderit nulla et ipsum irure amet commodo aliqua et sint voluptate nisi ut laboris.</p>
        <ul>
          <li>One</li>
          <li>Two</li>
        </ul>
      HTML

      styles = <<~CSS.strip
        p { color: red; }
        h1 { color: blue; }
      CSS

      VCR.use_cassette("html_to_image/success") do
        client = HtmlToImage.new
        image = client.image(html: html, theme: "light", width: 700, styles: styles)
        assert_not_nil image
      end
    end

    it "raises a ConnectionFailedError when the service is unavailable" do
      Faraday::Connection.any_instance.expects(:post).raises(Faraday::ConnectionFailed)

      assert_raises HtmlToImage::ConnectionFailedError do
        HtmlToImage.new.image(html: "<p>foo</p>", theme: "light", width: 700, styles: "p { color: red; }")
      end
    end

    it "raises a ServerError when server returns a 500" do
      VCR.use_cassette("html_to_image/server_error") do
        assert_raises HtmlToImage::ServerError do
          assert_nil HtmlToImage.new.image(html: "<p>foo</p>", theme: "light", width: 700, styles: "p { color: red; }")
        end
      end
    end
  end
end
