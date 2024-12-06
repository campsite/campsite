# frozen_string_literal: true

module FigmaEvents
  class BaseEvent
    class InvalidPasscodeError < StandardError
      def message
        "unrecognized passcode"
      end
    end

    attr_reader :params

    def initialize(params)
      @params = params
      raise InvalidPasscodeError unless valid_passcode?
    end

    def file_key
      params["file_key"]
    end

    private

    def valid_passcode?
      ActiveSupport::SecurityUtils.secure_compare(passcode, Rails.application.credentials.figma.webhook_passcode)
    end

    def passcode
      params["passcode"]
    end
  end
end
