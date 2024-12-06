# frozen_string_literal: true

class LinearClient
  class LinearClientError < StandardError; end
  class ConnectionFailedError < LinearClientError; end
  class UnauthorizedError < LinearClientError; end
  class GraphQLError < LinearClientError; end
  class ServerError < LinearClientError; end

  class RateLimitedError < LinearClientError
    attr_reader :reset_in, :reset_at

    def initialize(reset_at)
      @reset_at = reset_at
      @reset_in = reset_at - Time.now.to_i
    end
  end

  def initialize(authtoken)
    @authtoken = authtoken
  end

  def teams
    @teams ||= Teams.new(self)
  end

  def issues
    @issues ||= Issues.new(self)
  end

  def attachments
    @attachments ||= Attachments.new(self)
  end

  def send(body)
    response = connection.post("graphql", body)

    case response.status
    when 200
      errors = response.body.dig("errors")
      if errors.blank? || errors.empty?
        response
      else
        raise GraphQLError, errors[0]["message"] + ": " + errors[0].dig("extensions", "userPresentableMessage")
      end
    when 400..499
      error = response.body.dig("errors", 0)
      message = error&.dig("message")
      user_message = error&.dig("extensions", "userPresentableMessage")
      code_message = error&.dig("extensions", "code")
      if message.include?("Authentication required")
        raise UnauthorizedError
      elsif message.present? && user_message.present?
        exception_message = user_message.present? ? message + ": " + user_message : message
        raise GraphQLError, exception_message
      elsif code_message == "RATELIMITED"
        reset_at = response.headers["X-RateLimit-Requests-Reset"]
        raise RateLimitedError, reset_at
      else
        raise ServerError, response.body || "Unknown 400-499 server error"
      end
    else
      raise ServerError, response.body || "Unknown server error"
    end
  rescue Faraday::ConnectionFailed
    raise ConnectionFailedError
  end

  def gql_params(params)
    params.map { |key, value| "#{key}: #{value.is_a?(String) ? "\"#{value}\"" : value}" }.join(", ")
  end

  private

  def connection
    @connection ||= Faraday.new(
      url: "https://api.linear.app/",
      headers: {
        "Content-Type": "application/json",
        "Authorization": @authtoken,
      },
    ) do |f|
      f.response(:json)
    end
  end
end
