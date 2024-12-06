# frozen_string_literal: true

require "sidekiq_exception_handling_middleware"
require "sidekiq_pusher_socket_id_client_middleware"
require "sidekiq_pusher_socket_id_server_middleware"

Sidekiq.strict_args!

SidekiqScheduler::Scheduler.instance.enabled = Rails.env.production?

Sidekiq.configure_server do |config|
  config.redis = { url: Rails.application.credentials&.redis_sidekiq&.fetch(:url) }

  # The jobs running in the Sidekiq server can themselves push new jobs to Sidekiq, thus acting as clients.
  # https://github.com/sidekiq/sidekiq/wiki/Middleware#client-middleware-registered-in-both-places
  config.client_middleware do |chain|
    chain.add(SidekiqPusherSocketIdClientMiddleware)
  end
  config.server_middleware do |chain|
    chain.add(SidekiqExceptionHandlingMiddleware)
    chain.add(SidekiqPusherSocketIdServerMiddleware)
  end
end

Sidekiq.configure_client do |config|
  config.redis = { url: Rails.application.credentials&.redis_sidekiq&.fetch(:url) }

  config.client_middleware do |chain|
    chain.add(SidekiqPusherSocketIdClientMiddleware)
  end

  config.logger = Rails.logger if Rails.env.test?
end
