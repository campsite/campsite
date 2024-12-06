# frozen_string_literal: true

class HtmlTransform
  class RelativeTime < Base
    NODE_NAMES = ["relative-time"].freeze

    def plain_text
      relative_time
    end

    def markdown
      relative_time
    end

    def relative_time
      timestamp = node["timestamp"]
      original_tz = node["originaltz"]

      return "" if timestamp.nil? || original_tz.nil?

      time = Time.at(timestamp.to_i / 1000).in_time_zone(original_tz)
      formatted_time = time.strftime("%I:%M%P")
      timezone_abbr = time.strftime("%Z")

      "#{formatted_time.sub(/^0/, "").downcase} #{timezone_abbr}"
    end
  end
end
