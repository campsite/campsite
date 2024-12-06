# frozen_string_literal: true

class BaseJob
  include Sidekiq::Worker

  sidekiq_retries_exhausted do |msg, e|
    Sidekiq.logger.warn("Worker Failed:  #{msg["class"]} with #{msg["args"]}: #{msg["error_message"]}")
    Sentry.capture_exception(e)
  end
end
