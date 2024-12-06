# frozen_string_literal: true

class DurationFormatter
  def initialize(in_seconds:)
    @duration = ActiveSupport::Duration.build(in_seconds)
  end

  attr_reader :duration

  def format
    parts = duration.parts

    if duration < 55.seconds
      "#{parts[:seconds].to_i.round(-1)}s"
    elsif duration < 1.minute
      "1m"
    elsif duration < 1.hour
      "#{parts[:minutes].to_i}m"
    else
      hours = parts[:hours].to_i
      minutes = parts[:minutes].to_i
      ["#{hours}h", minutes > 0 ? "#{minutes}m" : nil].compact.join(" ")
    end
  end
end
