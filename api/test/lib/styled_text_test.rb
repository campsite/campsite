# frozen_string_literal: true

require "test_helper"

class StyledTextTest < ActiveSupport::TestCase
  describe "#html_to_slack_blocks" do
    it "accepts HTML and returns Slack blocks" do
      html = <<~HTML.strip
        <h1>My markdown</h1>
        <hr>
        <p>It has <b>bold</b> and <i>italics</i> and a <a href="https://campsite.design"><b>bold link</b></a>.</p>
        <p>It has multiple paragraphs.</p>
      HTML

      expected_blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*My markdown*",
            verbatim: true,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "It has *bold* and _italics_ and a <https://campsite.design|*bold link*>.",
            verbatim: true,
          },
        },
        {
          type: "section",
          text: {
            text: "It has multiple paragraphs.",
            type: "mrkdwn",
            verbatim: true,
          },
        },
      ]

      VCR.use_cassette("html_to_slack/success") do
        client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
        assert_equal expected_blocks, client.html_to_slack_blocks(html)
      end
    end

    it "raises a ConnectionFailedError when the service is unavailable" do
      Faraday::Connection.any_instance.expects(:post).raises(Faraday::ConnectionFailed)

      assert_raises StyledText::ConnectionFailedError do
        StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken)).html_to_slack_blocks("<b>hey</b>")
      end
    end

    it "raises an UnauthorizedEroor when auth token is incorrect" do
      VCR.use_cassette("html_to_slack/unauthorized") do
        assert_raises StyledText::UnauthorizedError do
          StyledText.new("invalid-token").html_to_slack_blocks("<b>hey</b>")
        end
      end
    end

    it "raises a ServerError when server returns a 500" do
      VCR.use_cassette("html_to_slack/server_error") do
        assert_raises StyledText::ServerError do
          StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken)).html_to_slack_blocks("<b>hey</b>")
        end
      end
    end
  end

  describe "#markdown_to_html" do
    it "accepts markdown and returns HTML" do
      markdown = <<~MARKDOWN.strip
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
        ##### Heading 5
        ###### Heading 6

        This is a paragraph with **bold** and italics.

        - Bullet one
        - Bullet two

        1. Number one
        2. Number two

        ```
        const foo = "bar"
        ```

        Hard break
        Soft break

        ---

        ![CleanShot 2024-03-22 at 16 42 23@2x](https://github.com/campsite/campsite/assets/739696/49b398b1-8c03-4255-a759-21b8b53a3f5d)

        | Header | Header | Header |
        |--------|--------|--------|
        | Cell | Cell | Cell |
        | Cell | Cell | Cell |#{" "}

        > Ullamco eiusmod laborum minim nulla adipisicing incididunt occaecat consequat non ipsum ex qui excepteur culpa.

        And [here](https://linear.app/campsite/issue/CAM-6845/normalize-notes) is a link. With a `inline code` mark.
      MARKDOWN

      VCR.use_cassette("markdown_to_html/success") do
        client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
        assert_not_nil client.markdown_to_html(markdown: markdown, editor: "markdown")
      end
    end

    it "raises a ConnectionFailedError when the service is unavailable" do
      Faraday::Connection.any_instance.expects(:post).raises(Faraday::ConnectionFailed)

      assert_raises StyledText::ConnectionFailedError do
        StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
          .markdown_to_html(markdown: "**hey**", editor: "markdown")
      end
    end

    it "raises an UnauthorizedEroor when auth token is incorrect" do
      VCR.use_cassette("markdown_to_html/unauthorized") do
        assert_raises StyledText::UnauthorizedError do
          StyledText.new("invalid-token").markdown_to_html(markdown: "**hey**", editor: "markdown")
        end
      end
    end

    it "raises a ServerError when server returns a 500" do
      VCR.use_cassette("markdown_to_html/server_error") do
        assert_raises StyledText::ServerError do
          StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
            .markdown_to_html(markdown: "**hey**", editor: "markdown")
        end
      end
    end
  end
end
