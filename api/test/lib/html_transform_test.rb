# frozen_string_literal: true

require "test_helper"

class HtmlTransformTest < ActiveSupport::TestCase
  describe "#plain_text" do
    it "handles paragraphs" do
      html = "<p>Hello world</p>"
      expected = "Hello world"
      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts ordered lists to numbers" do
      html = <<~HTML.squish
        <ol><li>One</li><li>Two</li><li>Three</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
        2. Two
        3. Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts unordered lists to bullets" do
      html = <<~HTML.squish
        <ul><li>One</li><li>Two</li><li>Three</li></ul>
      HTML

      expected = <<~TEXT.strip
        • One
        • Two
        • Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "indents nested ordered lists" do
      html = <<~HTML.squish
        <ol><li>One<ol><li>Two</li><li>Three</li></ol></li><li>Four</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
          1. Two
          2. Three
        2. Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "indents nested bullet lists" do
      html = <<~HTML.squish
        <ul><li>One<ul><li>Two</li><li>Three</li></ul></li><li>Four</li></ul>
      HTML

      expected = <<~TEXT.strip
        • One
          • Two
          • Three
        • Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "indents blended lists" do
      html = <<~HTML.squish
        <ol><li>One<ul><li>Two</li><li>Three</li></ul></li><li>Four</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
          • Two
          • Three
        2. Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "works with custom start numbers" do
      html = <<~HTML.squish
        <ol start="2"><li>One</li><li>Two</li><li>Three</li></ol>
      HTML

      expected = <<~TEXT.strip
        2. One
        3. Two
        4. Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "formats inline elements as a single string" do
      html = <<~HTML.squish
        <p>The <strong>quick</strong> brown fox <b>jumps</b> over <em>the</em> lazy dog</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "formats nested inline elements as a single string" do
      html = <<~HTML.squish
        <p>The <strong>quick brown fox <b>jumps over <em>the</em></b> lazy dog</strong></p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "separates block elements with newlines" do
      html = <<~HTML.squish
        <p>The quick brown fox</p><p>jumps over the lazy dog</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox

        jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "replaces soft breaks with a single newline" do
      html = <<~HTML.squish
        <p>The quick brown fox<br />jumps over the lazy dog</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox
        jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "ignores extra whitespace" do
      html = <<~HTML.strip
              <p>The quick brown fox

        <br />

        jumps over the lazy dog</p>




        <p>Foo bar</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox
        jumps over the lazy dog

        Foo bar
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "strips unsupported elements" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <script>alert("foo")</script>
        <figure><img src="foo.jpg" alt="Foo"><figcaption>Foo</figcaption></figure>
        <table><tr><td>Foo</td></tr></table>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "strips post attachments" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "strips blockquotes when configured" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <blockquote><p>Hello</p></blockquote>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html, strip_quotes: true).plain_text
    end

    it "surrounds blockquotes with quotes" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <blockquote><p>Hello</p><p>World</p></blockquote>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        "Hello
        World"

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "formats code as original" do
      html = <<~HTML.strip
        <p>Foo bar</p>
        <pre>
        <code>
        const foo = "bar";
        function log() {
          console.log(foo);
        }
        </code>
        </pre>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        const foo = "bar";
        function log() {
          console.log(foo);
        }

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "formats inline code" do
      html = <<~HTML.strip
        <p>Here's an example <code>const foo = "bar";</code>. Right?</p>
      HTML

      expected = <<~TEXT.strip
        Here's an example const foo = "bar";. Right?
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "includes link content" do
      html = <<~HTML.squish
        <p>Foo bar <a href="https://example.com">link</a></p>
      HTML

      expected = <<~TEXT.strip
        Foo bar link
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts task lists to bullets" do
      # copied from a prod post
      html = <<~TEXT.strip
        <ul class="task-list" data-type="taskList">
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked><span></span></label><div><p>one</p></div>
          </li>
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked><span></span></label><div><p>two</p></div>
          </li>
          <li class="task-item" data-checked="false" data-type="taskItem">
            <label><input type="checkbox"><span></span></label><div><p>three</p></div>
          </li>
        </ul>
      TEXT

      expected = <<~TEXT.strip
        • one
        • two
        • three
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "keeps plain text unchanged" do
      html = <<~HTML.squish
        hello world
      HTML

      expected = <<~TEXT.strip
        hello world
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts custom reactions to plain text" do
      html = <<~HTML.squish
        <p>Yes sir! <img data-type="reaction" src="/meow-boat-captain.png" alt="meow-boat-captain" draggable="false" data-id="0rv90xk1ll0z" data-name="meow-boat-captain"> </p>
      HTML

      expected = <<~TEXT.strip
        Yes sir! :meow-boat-captain:
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts native reactions to plain text" do
      html = <<~HTML.squish
        <p> Time for <span data-type="reaction" data-id="m" data-name="camping">🏕️</span> camping </p>
      HTML

      expected = <<~TEXT.strip
        Time for 🏕️ camping
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts multiple reaction with mixed content to plain text" do
      html = <<~HTML.squish
        <p>Offsite is gonna be <strong><em>packed</em> <span data-type="reaction" data-id="school_satchel" data-name="Backpack">🎒</span> with</strong> <s>sweets</s> and <img data-type="reaction" src="/nyan-parrot.gif" alt="nyan-parrot" draggable="false" data-id="v1yxnv0hecd6" data-name="nyan-parrot"></p>
      HTML

      expected = <<~TEXT.strip
        Offsite is gonna be packed 🎒 with sweets and :nyan-parrot:
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts link unfurls" do
      html = <<~HTML.squish
        <p>Check out this link:</p>
        <link-unfurl href="hampsterdance.com"></link-unfurl>
      HTML

      expected = <<~TEXT.strip
        Check out this link:

        hampsterdance.com
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts lone link unfurls and removes whitespace" do
      html = <<~HTML.squish
        <link-unfurl href="hampsterdance.com"></link-unfurl>
      HTML

      expected = <<~TEXT.strip
        hampsterdance.com
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "respects whitespace for links" do
      html = <<~HTML.squish
        <p><em>Dan Philibin created a </em><a class="prose-link" target="_blank" href="https://linear.app/campsite/issue/CAM-8483/canvas-comments-dont-reset-their-position"><span><em>ticket</em></span></a><em> in Linear from this post</em></p>
      HTML

      expected = <<~TEXT.strip
        Dan Philibin created a ticket in Linear from this post
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts resource mentions when they exist in the map" do
      html = <<~HTML.squish
        <p>Check out <resource-mention href="https://campsite.com/posts/123"></resource-mention> and then <resource-mention href="https://campsite.com/posts/456"></resource-mention></p>
      HTML

      expected = <<~TEXT.strip
        Check out Foo Bar and then https://campsite.com/posts/456
      TEXT

      map = {
        "https://campsite.com/posts/123" => "Foo Bar",
      }

      assert_equal expected, HtmlTransform.new(html, resource_mention_map: map).plain_text
    end

    it "converts relative times" do
      # testing capitalized originalTz tests how Nokogiri downcases attribute names
      html = <<~HTML.squish
        <p>Post created at <relative-time timestamp="1714857600000" originalTz="America/New_York"></relative-time></p>
      HTML

      expected = <<~TEXT.strip
        Post created at 5:20pm EDT
      TEXT

      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "converts mentions" do
      html = <<~HTML.squish
        <p>Hello <span data-type="mention" data-id="abcdefghijkl" data-label="foo_bar" data-role="member" data-username="foo_bar">@foo_bar</span></p>
      HTML
      expected = "Hello @foo_bar"
      assert_equal expected, HtmlTransform.new(html).plain_text
    end

    it "strips media gallery" do
      html = <<~HTML.squish
        <media-gallery></media-gallery>
      HTML
      assert_equal "", HtmlTransform.new(html).plain_text
    end
  end

  describe "#markdown" do
    it "handles paragraphs" do
      html = "<p>Hello world</p>"
      expected = "Hello world"
      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts ordered lists to numbers" do
      html = <<~HTML.squish
        <ol><li>One</li><li>Two</li><li>Three</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
        2. Two
        3. Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts unordered lists to bullets" do
      html = <<~HTML.squish
        <ul><li>One</li><li>Two</li><li>Three</li></ul>
      HTML

      expected = <<~TEXT.strip
        - One
        - Two
        - Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "indents nested ordered lists" do
      html = <<~HTML.squish
        <ol><li>One<ol><li>Two</li><li>Three</li></ol></li><li>Four</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
          1. Two
          2. Three
        2. Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "indents nested bullet lists" do
      html = <<~HTML.squish
        <ul><li>One<ul><li>Two</li><li>Three</li></ul></li><li>Four</li></ul>
      HTML

      expected = <<~TEXT.strip
        - One
          - Two
          - Three
        - Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "indents blended lists" do
      html = <<~HTML.squish
        <ol><li>One<ul><li>Two</li><li>Three</li></ul></li><li>Four</li></ol>
      HTML

      expected = <<~TEXT.strip
        1. One
          - Two
          - Three
        2. Four
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "works with custom start numbers" do
      html = <<~HTML.squish
        <ol start="2"><li>One</li><li>Two</li><li>Three</li></ol>
      HTML

      expected = <<~TEXT.strip
        2. One
        3. Two
        4. Three
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "formats inline elements as a single string" do
      html = <<~HTML.squish
        <p>The <strong>quick</strong> brown fox <b>jumps</b> over <em>the</em> lazy <i>dog</i></p>
      HTML

      expected = <<~TEXT.strip
        The **quick** brown fox **jumps** over _the_ lazy _dog_
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "formats nested inline elements as a single string" do
      html = <<~HTML.squish
        <p>The <strong>quick brown fox jumps over <em>the</em> lazy dog</strong></p>
      HTML

      expected = <<~TEXT.strip
        The **quick brown fox jumps over _the_ lazy dog**
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "separates block elements with newlines" do
      html = <<~HTML.squish
        <p>The quick brown fox</p><p>jumps over the lazy dog</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox

        jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "replaces soft breaks with a single newline" do
      html = <<~HTML.squish
        <p>The quick brown fox<br />jumps over the lazy dog</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox
        jumps over the lazy dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "ignores extra whitespace" do
      html = <<~HTML.strip
              <p>The quick brown fox

        <br />

        jumps over the lazy dog</p>




        <p>Foo bar</p>
      HTML

      expected = <<~TEXT.strip
        The quick brown fox
        jumps over the lazy dog

        Foo bar
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "strips unsupported elements" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <script>alert("foo")</script>
        <figure><img src="foo.jpg" alt="Foo"><figcaption>Foo</figcaption></figure>
        <table><tr><td>Foo</td></tr></table>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "keeps post attachments" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "strips blockquotes when configured" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <blockquote><p>Hello</p></blockquote>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html, strip_quotes: true).markdown
    end

    it "surrounds blockquotes with quotes" do
      html = <<~HTML.squish
        <p>Foo bar</p>
        <blockquote><p>Hello</p><p>World</p></blockquote>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        > Hello
        > World

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "formats code as original" do
      html = <<~HTML.strip
        <p>Foo bar</p>
        <pre>
        <code>
        const foo = "bar";
        function log() {
          console.log(foo);
        }
        </code>
        </pre>
        <p>Cat dog</p>
      HTML

      expected = <<~TEXT.strip
        Foo bar

        ```
        const foo = "bar";
        function log() {
          console.log(foo);
        }
        ```

        Cat dog
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "formats inline code" do
      html = <<~HTML.strip
        <p>Here's an example <code>const foo = "bar";</code>. Right?</p>
      HTML

      expected = <<~TEXT.strip
        Here's an example `const foo = "bar";`. Right?
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "includes link content" do
      html = <<~HTML.squish
        <p>Foo bar <a href="https://example.com">link</a></p>
      HTML

      expected = <<~TEXT.strip
        Foo bar [link](https://example.com)
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts task lists to bullets" do
      # copied from a prod post
      html = <<~TEXT.strip
        <ul class="task-list" data-type="taskList">
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked><span></span></label><div><p>one</p></div>
          </li>
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked><span></span></label><div><p>two</p></div>
          </li>
          <li class="task-item" data-checked="false" data-type="taskItem">
            <label><input type="checkbox"><span></span></label><div><p>three</p></div>
          </li>
        </ul>
      TEXT

      expected = <<~TEXT.strip
        - [x] one
        - [x] two
        - [ ] three
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "keeps plain text unchanged" do
      html = <<~HTML.squish
        hello world
      HTML

      expected = <<~TEXT.strip
        hello world
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts custom reactions to plain text" do
      html = <<~HTML.squish
        <p>Yes sir! <img data-type="reaction" src="/meow-boat-captain.png" alt="meow-boat-captain" draggable="false" data-id="0rv90xk1ll0z" data-name="meow-boat-captain"> </p>
      HTML

      expected = <<~TEXT.strip
        Yes sir! :meow-boat-captain:
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts native reactions to plain text" do
      html = <<~HTML.squish
        <p> Time for <span data-type="reaction" data-id="m" data-name="camping">🏕️</span> camping </p>
      HTML

      expected = <<~TEXT.strip
        Time for 🏕️ camping
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts multiple reaction with mixed content to plain text" do
      html = <<~HTML.squish
        <p>Offsite is gonna be <strong><em>packed</em> <span data-type="reaction" data-id="school_satchel" data-name="Backpack">🎒</span> with</strong> <s>sweets</s> and <img data-type="reaction" src="/nyan-parrot.gif" alt="nyan-parrot" draggable="false" data-id="v1yxnv0hecd6" data-name="nyan-parrot"></p>
      HTML

      expected = <<~TEXT.strip
        Offsite is gonna be **_packed_ 🎒 with** ~~sweets~~ and :nyan-parrot:
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts link unfurls" do
      html = <<~HTML.squish
        <p>Check out this link:</p>
        <link-unfurl href="hampsterdance.com"></link-unfurl>
      HTML

      expected = <<~TEXT.strip
        Check out this link:

        <link-unfurl href="hampsterdance.com"></link-unfurl>
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts lone link unfurls and removes whitespace" do
      html = <<~HTML.squish
        <link-unfurl href="hampsterdance.com"></link-unfurl>
      HTML

      expected = <<~TEXT.strip
        <link-unfurl href="hampsterdance.com"></link-unfurl>
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "respects whitespace for links" do
      html = <<~HTML.squish
        <p><em>Dan Philibin created a </em><a class="prose-link" target="_blank" href="https://linear.app/campsite/issue/CAM-8483/canvas-comments-dont-reset-their-position"><span><em>ticket</em></span></a><em> in Linear from this post</em></p>
      HTML

      expected = <<~TEXT.strip
        _Dan Philibin created a _[_ticket_](https://linear.app/campsite/issue/CAM-8483/canvas-comments-dont-reset-their-position)_ in Linear from this post_
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts resource mentions when they exist in the map" do
      html = <<~HTML.squish
        <p>Check out <resource-mention href="https://campsite.com/posts/123"></resource-mention> and then <resource-mention href="https://campsite.com/posts/456"></resource-mention></p>
      HTML

      expected = <<~TEXT.strip
        Check out <resource-mention href="https://campsite.com/posts/123"></resource-mention> and then <resource-mention href="https://campsite.com/posts/456"></resource-mention>
      TEXT

      map = {
        "https://campsite.com/posts/123" => "Foo Bar",
      }

      assert_equal expected, HtmlTransform.new(html, resource_mention_map: map).markdown
    end

    it "converts relative times" do
      # testing capitalized originalTz tests how Nokogiri downcases attribute names
      html = <<~HTML.squish
        <p>Post created at <relative-time timestamp="1714857600000" originalTz="America/New_York"></relative-time></p>
      HTML

      expected = <<~TEXT.strip
        Post created at 5:20pm EDT
      TEXT

      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts mentions" do
      html = <<~HTML.squish
        <p>Hello <span data-type="mention" data-id="abcdefghijkl" data-label="foo_bar" data-role="member" data-username="foo_bar">@foo_bar</span></p>
      HTML
      expected = "Hello <@abcdefghijkl>"
      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts details" do
      html = <<~HTML.squish
        <details><summary>Click me</summary><p><b>Hello</b> world</p></details>
      HTML
      expected = <<~TEXT.strip
        <details>

        <summary>Click me</summary>

        **Hello** world

        </details>
      TEXT
      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts tiptap details" do
      html = <<~HTML.squish
        <details><summary>Click me</summary><div data-type="detailsContent"><p><b>Hello</b> world</p></div></details>
      HTML
      expected = <<~TEXT.strip
        <details>

        <summary>Click me</summary>

        **Hello** world

        </details>
      TEXT
      assert_equal expected, HtmlTransform.new(html).markdown
    end

    it "converts media gallery" do
      html = <<~HTML.squish
        <media-gallery>
          <media-gallery-item id="abc123" />
          <media-gallery-item id="def456" />
          <media-gallery-item id="ghi789" />
        </media-gallery>
      HTML
      expected = <<~HTML.strip
        <media-gallery> <media-gallery-item id="abc123"></media-gallery-item> <media-gallery-item id="def456"></media-gallery-item> <media-gallery-item id="ghi789"></media-gallery-item> </media-gallery>
      HTML
      assert_equal expected, HtmlTransform.new(html).markdown
    end

    describe "export" do
      it "converts link unfurls" do
        html = <<~HTML.squish
          <link-unfurl href="hampsterdance.com"></link-unfurl>
        HTML

        expected = <<~TEXT.strip
          [hampsterdance.com](hampsterdance.com)
        TEXT

        assert_equal expected, HtmlTransform.new(html, export: true).markdown
      end

      it "converts media gallery" do
        html = <<~HTML.squish
          <media-gallery>
            <media-gallery-item id="1" file_type="image/jpeg" />
            <media-gallery-item id="2" file_type="image/gif" />
            <media-gallery-item id="3" file_type="application/pdf" />
          </media-gallery>
        HTML
        expected = <<~TEXT.strip
          ![1](1.jpeg)

          ![2](2.gif)

          [3](3.pdf)
        TEXT
        assert_equal expected, HtmlTransform.new(html, export: true).markdown
      end

      it "converts post attachments" do
        html = <<~HTML.squish
          <p>Foo bar</p>
          <post-attachment id="1" file_type="image/png" width="1400" height="800"></post-attachment>
          <p>Cat dog</p>
        HTML

        expected = <<~TEXT.strip
          Foo bar

          ![1](1.png)

          Cat dog
        TEXT

        assert_equal expected, HtmlTransform.new(html, export: true).markdown
      end

      it "converts resource mentions" do
        html = <<~HTML.squish
          <p>Check out <resource-mention href="https://campsite.com/posts/123"></resource-mention> and then <resource-mention href="https://campsite.com/posts/456"></resource-mention></p>
        HTML

        expected = <<~TEXT.strip
          Check out [https://campsite.com/posts/123](https://campsite.com/posts/123) and then [https://campsite.com/posts/456](https://campsite.com/posts/456)
        TEXT

        assert_equal expected, HtmlTransform.new(html, export: true).markdown
      end
    end
  end
end
