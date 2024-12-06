# frozen_string_literal: true

require "test_helper"

class HtmlTruncatorTest < ActiveSupport::TestCase
  describe "#truncate_after_css" do
    test "returns the first paragraph" do
      input = <<~HTML.chomp
        <p>My first paragraph.</p>
        <p>My second paragraph.</p>
        <p>My third paragraph.</p>
      HTML

      expected = <<~HTML.chomp
        <p>My first paragraph…</p>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_after_css("p").to_html
    end

    test "returns everything up until the first paragraph" do
      input = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item.</li>
            <li>My second list item.</li>
            <li>My third list item.</li>
          </ul>
          <p>My first paragraph.</p>
          <p>My second paragraph.</p>
          <p>My third paragraph.</p>
        </div>
      HTML

      expected = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item.</li>
            <li>My second list item.</li>
            <li>My third list item.</li>
          </ul>
          <p>My first paragraph…</p>
        </div>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_after_css("p").to_html
    end

    test "doesn't add ellipsis if no truncation occurs" do
      input = "<p>No truncation needed!</p>"

      assert_equal input, HtmlTruncator.new(input).truncate_after_css("p").to_html
    end

    test "doesn't modify invalid HTML markup if no truncation occurs" do
      # <br /> is XHTML syntax, the trailing slash is ignored in HTML.
      # https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags
      input = "<p>No truncation<br /> needed!</p>"

      assert_equal input, HtmlTruncator.new(input).truncate_after_css("p").to_html
    end

    test "returns everything if selector not found" do
      input = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item</li>
            <li>My second list item</li>
            <li>My third list item</li>
          </ul>
          <h2>My second heading</h2>
          <h2>My third heading</h2>
        </div>
      HTML

      assert_equal input, HtmlTruncator.new(input).truncate_after_css("p").to_html
    end
  end

  describe "#truncate_after_character_count" do
    test "returns a single element" do
      input = <<~HTML.chomp
        <p>My first paragraph.</p>
        <p>My second paragraph.</p>
        <p>My third paragraph.</p>
      HTML

      expected = <<~HTML.chomp
        <p>My first paragraph…</p>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_after_character_count(15).to_html
    end

    test "returns multiple elements" do
      input = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item.</li>
            <li>My second list item.</li>
            <li>My third list item.</li>
          </ul>
          <p>My first paragraph.</p>
          <p>My second paragraph.</p>
          <p>My third paragraph.</p>
        </div>
      HTML

      expected = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item.</li>
            <li>My second list item.</li>
            <li>My third list item.</li>
          </ul>
          <p>My first paragraph…</p>
        </div>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_after_character_count(80).to_html
    end

    test "doesn't add ellipsis if no truncation occurs" do
      input = "<p>No truncation needed!</p>"

      assert_equal input, HtmlTruncator.new(input).truncate_after_character_count(25).to_html
    end

    test "doesn't modify invalid HTML markup if no truncation occurs" do
      # <br /> is XHTML syntax, the trailing slash is ignored in HTML.
      # https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags
      input = "<p>No truncation<br /> needed!</p>"

      assert_equal input, HtmlTruncator.new(input).truncate_after_character_count(25).to_html
    end

    test "returns everything if minimum_removed_characters not met" do
      input = <<~HTML.chomp
        <div>
          <h1>My heading</h1>
          <ul>
            <li>My first list item</li>
            <li>My second list item</li>
            <li>My third list item</li>
          </ul>
          <h2>My second heading</h2>
          <h2>My third heading</h2>
        </div>
      HTML

      assert_equal input, HtmlTruncator.new(input).truncate_after_character_count(80, minimum_removed_characters: 20).to_html
    end

    test "doesn't start truncating inside of a 'non-truncatable' element" do
      input = <<~HTML.chomp
        <p>We should see this whole paragraph and not stop when I mention <a>@nholden</a> 'cause that would look weird.</p>
        <p>We can drop this paragraph though.</p>
      HTML

      expected = <<~HTML.chomp
        <p>We should see this whole paragraph and not stop when I mention <a>@nholden</a> 'cause that would look weird…</p>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_after_character_count(50).to_html
    end
  end

  describe "#truncate_before_attachments_at_end" do
    test "truncates before attachments at the end of a post" do
      input = <<~HTML.chomp.gsub("\n", "")
        <p>We should only see this paragraph.</p>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <post-attachment id="2" file_type="image/png" width="1400" height="800"></post-attachment>
        <post-attachment id="3" file_type="image/png" width="1400" height="800"></post-attachment>
      HTML

      expected = <<~HTML.chomp.gsub("\n", "")
        <p>We should only see this paragraph.</p>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_before_attachments_at_end.to_html
    end

    test "doesn't truncate attachments that aren't at the end of a post" do
      expected = <<~HTML.chomp.gsub("\n", "")
        <p>We should see this paragraph and the one at the end.</p>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <p>This is the one at the end.</p>
      HTML

      assert_equal expected, HtmlTruncator.new(expected).truncate_before_attachments_at_end.to_html
    end

    test "doesn't truncate file attachments" do
      input = <<~HTML.chomp.gsub("\n", "")
        <p>We should see this paragraph and the one at the end.</p>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <post-attachment id="1" file_type="application/pdf"></post-attachment>
      HTML

      expected = <<~HTML.chomp.gsub("\n", "")
        <p>We should see this paragraph and the one at the end.</p>
        <post-attachment id="1" file_type="application/pdf"></post-attachment>
      HTML

      assert_equal expected, HtmlTruncator.new(input).truncate_before_attachments_at_end.to_html
    end
  end
end
