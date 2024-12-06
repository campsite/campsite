# frozen_string_literal: true

Sentry.init do |config|
  config.dsn = Rails.application.credentials&.sentry&.fetch(:dsn)
  config.breadcrumbs_logger = [:active_support_logger, :http_logger, :sentry_logger]
  config.enabled_environments = ["production"]
  config.release = ENV["RELEASE_SHA"]
  config.rails.db_query_source_threshold_ms = 20 # milliseconds
  config.excluded_exceptions << "DeliverWebhookJob::DeliveryError"

  if Sidekiq.server?
    config.excluded_exceptions.delete("ActiveRecord::RecordNotFound")
  end

  config.traces_sample_rate = 0
end
