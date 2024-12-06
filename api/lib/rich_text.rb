# frozen_string_literal: true

class RichText
  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::AssetTagHelper

  def initialize(original)
    @parsed = Nokogiri::HTML.fragment(original)
  end

  attr_reader :members_base_url, :image_size

  def to_s
    @parsed.to_s
  end

  def text
    @parsed.text
  end

  def replace_mentions_with_links(members_base_url:)
    mentions = @parsed.css("span[data-type='mention']")

    mentions.each do |node|
      if (name = node.attr("data-label")) && (username = node.attr("data-username"))
        node.replace(link_to("@#{name}", "#{members_base_url}/#{username}", class: "mention"))
      else
        node.replace(node.children)
      end
    end

    self
  end

  def replace_post_attachments_with_images(image_url_key: :original_url)
    attachment_ids = @parsed.css("post-attachment").map { |node| node.attr("id") }
    attachments = Attachment.where(public_id: attachment_ids).group_by(&:public_id)

    @parsed.css("post-attachment").each do |node|
      next unless (attachment = attachments[node.attr("id")]&.first)

      image_urls = attachment.image_urls

      width = image_url_key == :original_url ? attachment.width || 1440 : ImageUrls::WIDTHS[image_url_key]
      height = attachment.width && attachment.height ? (attachment.height.to_f / attachment.width.to_f) * width : 1440

      url = if image_urls
        image_urls.public_send(image_url_key)
      elsif attachment.previewable?
        attachment.resize_preview_url(width)
      end

      next unless url

      node.replace(
        content_tag(
          :div,
          image_tag(url, alt: "Uploaded preview", width: width, height: height, class: "w-full max-w-full object-contain max-h-[500px]"),
          class: "flex h-full w-full items-center justify-center py-2",
        ),
      )
    end

    self
  end

  def strip_description_comments
    @parsed.xpath(".//span[@commentid]").each do |span|
      span.replace(span.children)
    end

    self
  end

  def add_trailing_newlines_to_block_elements
    @parsed.css("div, p, h1, h2, h3, h4, h5, h6, ol, li").each do |block_element|
      block_element.content += "\n"
    end

    self
  end

  def replace_link_unfurls_with_html
    url_attr = "href"
    nodes = @parsed.css("link-unfurl")

    urls = nodes
      .map { |node| node.attr(url_attr) }
      .uniq.compact
      .map { |url| OpenGraphLink.normalize_url(url) }
    links = OpenGraphLink
      .where(url: urls)
      .index_by(&:url)

    nodes.each do |node|
      url = node.attr(url_attr)
      url = OpenGraphLink.normalize_url(url)
      link = links[url]

      has_title = link&.title.present?
      url = URI.parse(url).host if has_title
      host_tag = content_tag(:span, url, class: "text-tertiary text-sm truncate")
      title_tag = content_tag(:span, link.title, class: "line-clamp-1 min-w-0 text-[15px] font-medium text-primary") if has_title
      title_container = content_tag(
        :div,
        [title_tag, host_tag].compact.join.html_safe, # rubocop:disable Rails/OutputSafety
        class: "flex flex-1 flex-col justify-center gap-1 px-3 py-2.5 pr-5",
      )

      image_container = if (image_url = link&.image_url)
        content_tag(
          :div,
          image_tag(image_url, alt: "Uploaded preview", class: "flex h-full w-full object-cover object-center"),
          class: "flex h-[70px] border-l object-cover",
        )
      end

      node.replace(content_tag(
        :div,
        [title_container, image_container].compact.join.html_safe, # rubocop:disable Rails/OutputSafety
        class: "my-4 border-primary-opaque not-prose flex min-h-12 flex-1 overflow-hidden rounded-lg border",
      ))
    end

    self
  end

  def replace_link_unfurls_with_links
    @parsed.css("link-unfurl").each do |node|
      href = node.attr("href")
      href ? node.replace(link_to(href, href)) : node.remove
    end

    self
  end

  def replace_resource_mentions_with_links(organization)
    hrefs = @parsed.css("resource-mention").map { |node| node.attr("href") }
    resource_mentions = hrefs.map { |h| ResourceMentionCollection.resource_mention_from_url(h) }.compact

    posts = organization.posts.where(public_id: resource_mentions.select { |rm| rm[:type] == "posts" }.pluck(:id)).index_by(&:public_id)
    calls = organization.calls.where(public_id: resource_mentions.select { |rm| rm[:type] == "calls" }.pluck(:id)).index_by(&:public_id)
    notes = organization.notes.where(public_id: resource_mentions.select { |rm| rm[:type] == "notes" }.pluck(:id)).index_by(&:public_id)

    resource_mentions = resource_mentions.index_by { |rm| rm[:url] }

    @parsed.css("resource-mention").each do |node|
      unless (href = node.attr("href"))
        node.remove
        next
      end

      # at least replace with a link
      replace = link_to(href, href)

      if (resource = resource_mentions[href])

        subject = case resource[:type]
        when "posts"
          posts[resource[:id]]
        when "calls"
          calls[resource[:id]]
        when "notes"
          notes[resource[:id]]
        end

        if subject && subject.title.present?
          replace = link_to(subject.title, href)
        end
      end

      node.replace(replace)
    end

    self
  end
end
