# frozen_string_literal: true

# A replacement for https://github.com/jaimeiniesta/metainspector with fewer dependencies.
class MetaInspector
  class Error < StandardError; end

  class Images
    def initialize(page)
      @page = page
    end

    attr_reader :page

    delegate :parsed, :base_url, to: :page

    def favicon
      @favicon ||= begin
        href = parsed.xpath('//link[@rel="icon" or contains(@rel, "shortcut")]').first&.attributes&.dig("href")&.value
        return unless href

        parsed_href = URI.parse(href)
        parsed_href.absolute? ? href : URI.join(base_url, parsed_href).to_s
      rescue URI::InvalidURIError
        nil
      end
    end
  end

  def initialize(url)
    client = Faraday.new(url) do |f|
      f.options.timeout = 20
      f.options.open_timeout = 20
      f.response(:follow_redirects, limit: 10)
    end

    @response = client.get
    content_type = @response.headers["content-type"]
    raise Error, "URL must return HTML, got #{content_type}" if content_type && !content_type.start_with?("text/html")
  rescue Faraday::Error => e
    raise Error, e.message
  end

  attr_reader :response

  def meta
    @meta ||= parsed.css("meta").each_with_object({}) do |el, result|
      next unless el.attribute("content")

      if el.attribute("name")
        result[el.attribute("name").value] = el.attribute("content").value
      elsif el.attribute("property")
        result[el.attribute("property").value] = el.attribute("content").value
      end
    end
  end

  def best_title
    @best_title ||= begin
      candidates = [
        meta["title"],
        meta["og:title"],
        parsed.css("head title"),
        parsed.css("body title"),
        parsed.css("h1").first,
      ]
      candidates.flatten!
      candidates.compact!
      candidates.map! { |c| c.respond_to?(:inner_text) ? c.inner_text : c }
      candidates.map! { |c| c.strip.gsub(/\s+/, " ") }
      candidates.first
    end
  end

  def images
    Images.new(self)
  end

  def base_url
    @base_url ||= begin
      base_element_href = parsed.search("base").first&.attributes&.dig("href")&.value
      response_root_url = "#{response.env.url.scheme}://#{response.env.url.host}"

      return URI(response_root_url) unless base_element_href

      base_element_uri = URI(base_element_href)
      base_element_uri.absolute? ? base_element_uri : URI.join(response_root_url, base_element_href)
    end
  end

  def parsed
    @parsed ||= Nokogiri::HTML(response.success? ? response.body : nil)
  end
end
