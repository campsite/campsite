# frozen_string_literal: true

class FigmaEvent
  class UnrecognizedTypeError < StandardError
    def message
      "unrecognized Figma event type"
    end
  end

  def self.from_params(params)
    case params["event_type"]
    when FigmaEvents::Ping::TYPE
      return FigmaEvents::Ping.new(params)
    when FigmaEvents::FileComment::TYPE
      return FigmaEvents::FileComment.new(params)
    end

    raise UnrecognizedTypeError
  end
end
