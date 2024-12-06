# frozen_string_literal: true

class HtmlTruncator
  NOT_TRUNCATABLE_ELEMENTS = ["p", "li"]

  attr_accessor :html, :is_text_content_truncated

  def initialize(html)
    @html = html

    # there are multiple types of truncation we perform. shortening text is one, removing attachments is another.
    # the client needs to know if we've truncated *text content* (not attachments) so we can display a "read more" link.
    @is_text_content_truncated = false
  end

  def to_html
    @html
  end

  def truncate_after_css(selector)
    parsed_result = parsed_fragment.clone
    match = parsed_result.css(selector).first
    return self unless match

    current = match
    parent = current.parent
    truncated = false

    while parent
      current_passed = false
      parent.children.each do |child|
        if current_passed
          child.remove
          truncated = true
        end

        current_passed = true if child == current
      end
      current = current.parent
      parent = current.try(:parent)
    end

    return self unless truncated

    match.inner_html = "#{match.inner_html.gsub(/\.$/, "")}…"

    @is_text_content_truncated = true
    @html = parsed_result.to_html

    self
  end

  def truncate_after_character_count(maximum_characters, minimum_removed_characters: 0)
    parsed_result = parsed_fragment.clone
    passed_character_count = 0
    last_text_parent = nil
    elements_to_remove = []

    traverse_element = lambda do |element|
      return if element.nil?

      if elements_to_remove.any? || (passed_character_count > maximum_characters && can_start_truncation_with_element?(element))
        elements_to_remove << element
      elsif element.text? && element.text.match?(/\S+/)
        last_text_parent = element.parent
      end

      passed_character_count += element.text.length if element.text? && element.text.match?(/\S+/)

      element.children.each do |child|
        traverse_element.call(child)
      end
    end

    traverse_element.call(parsed_result)

    removed_character_count = elements_to_remove.select(&:text?).sum { |element| element.text.length }

    return self if removed_character_count <= minimum_removed_characters

    elements_to_remove.each do |element|
      element.remove
    end

    last_text_parent.inner_html = "#{last_text_parent.inner_html.gsub(/[\.…]+$/, "")}…"

    @is_text_content_truncated = true
    @html = parsed_result.to_html

    self
  end

  def truncate_before_attachments_at_end
    parsed_result = parsed_fragment.clone
    elements_to_remove = []
    last_elements = []

    traverse_element = lambda do |element|
      return if element.nil?

      if element.name == "post-attachment"
        if element_is_visual_media?(element)
          last_elements << element
        end
      else
        last_elements.clear
      end

      element.children.each do |child|
        traverse_element.call(child)
      end
    end

    traverse_element.call(parsed_result)

    unless last_elements.empty?
      elements_to_remove = last_elements
    end

    elements_to_remove.each(&:remove)

    @html = parsed_result.to_html
    self
  end

  private

  def parsed_fragment
    Nokogiri::HTML.fragment(html)
  end

  def can_start_truncation_with_element?(element)
    element.ancestors.map(&:name) & NOT_TRUNCATABLE_ELEMENTS == []
  end

  def element_is_visual_media?(element)
    return false unless element.name == "post-attachment"

    file_type_attr = element.attribute_nodes.find { |attr| attr.name == "file_type" }
    return false unless file_type_attr

    file_type = file_type_attr.value

    file_type.start_with?("image") || file_type.start_with?("video")
  end
end
