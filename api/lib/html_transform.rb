# frozen_string_literal: true

class HtmlTransform
  HANDLERS_BY_NODE_NAMES = [
    Text,
    List,
    ListItem,
    Paragraph,
    SoftBreak,
    Span,
    Image,
    Pre,
    Code,
    Blockquote,
    ResourceMention,
    LinkUnfurl,
    Drop,
    Italic,
    Strong,
    Link,
    RelativeTime,
    Strike,
    Input,
    PostAttachment,
    MediaGallery,
    Details,
    Summary,
  ].each_with_object({}) do |handler, result|
    handler::NODE_NAMES.each { |node_name| result[node_name] = handler }
  end.freeze

  def initialize(html, options = {})
    @html = html
    @context = Context.new(options)
  end

  attr_reader :html, :context

  def plain_text
    @plain_text ||= document.plain_text
  end

  def markdown
    @markdown ||= document.markdown
  end

  class Context
    def initialize(options = {})
      @options = options
    end

    def strip_quotes?
      !!@options[:strip_quotes]
    end

    def resource_mention_map
      @options[:resource_mention_map]
    end

    def export?
      !!@options[:export]
    end
  end

  private

  def document
    @document ||= Document.new(node: Nokogiri::HTML.fragment(html), context: context)
  end
end
