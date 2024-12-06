# frozen_string_literal: true

class SidekiqExceptionHandlingMiddleware
  include Sidekiq::ServerMiddleware

  def call(worker, job, queue)
    yield
  rescue Slack::Web::Api::Errors::TooManyRequestsError => e
    worker.class.perform_in(e.retry_after.seconds, *job["args"])
  end
end
