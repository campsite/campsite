# frozen_string_literal: true

class ResourceMentionCollection
  def initialize(parsed_html)
    @mentions = { posts: {}, calls: {}, notes: {} }

    parsed_html.css("resource-mention").each do |mention|
      href = mention["href"]
      next unless href

      begin
        match = ResourceMentionCollection.resource_mention_from_url(href)
        next unless match

        type = match[:type].to_sym

        @mentions[type][match[:id]] = match
      rescue URI::InvalidURIError
        next
      end
    end
  end

  def post_ids
    @mentions[:posts].keys
  end

  def call_ids
    @mentions[:calls].keys
  end

  def note_ids
    @mentions[:notes].keys
  end

  def add_fetched_results(posts_map:, calls_map:, notes_map:)
    @mentions[:posts].each do |id, mention|
      mention[:post] = posts_map[id]
    end

    @mentions[:calls].each do |id, mention|
      mention[:call] = calls_map[id]
    end

    @mentions[:notes].each do |id, mention|
      mention[:note] = notes_map[id]
    end
  end

  def serializer_array
    @mentions.values
      # get the values from each type hash
      .map { |hash| hash.values }
      # flatten into a single array
      .flatten
      # only select values that has a non-nil resource
      .select { |mention| mention[:post] || mention[:call] || mention[:note] }
  end

  def href_title_map
    @mentions.values.map do |hash|
      hash.values.map do |mention|
        title = mention[:post]&.display_title ||
          mention[:call]&.title ||
          mention[:note]&.title

        [mention[:url], title]
      end
    end.flatten(1).to_h
  end

  def self.resource_mention_from_url(url)
    url = URI.parse(url)
    match = url.path.match(%r{^/[^/]+/(posts|calls|notes)/([a-zA-Z0-9]{12})$})

    return unless match

    type = match[1]

    return unless ["posts", "calls", "notes"].include?(type)

    id = match[2]

    { type: type, id: id, url: url.to_s }
  end
end
