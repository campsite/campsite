# frozen_string_literal: true

require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module CampsiteApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults(7.1)

    # redirect to app after login without raising an error
    config.action_controller.raise_on_open_redirects = false

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    config.eager_load_paths << Rails.root.join("lib")

    config.time_zone = "UTC"
    config.active_record.default_timezone = :utc
    config.active_record.query_log_tags_enabled = true
    config.active_record.encryption.support_sha1_for_non_deterministic_encryption = true
    config.active_record.encryption.support_unencrypted_data = true
    config.active_record.queues.destroy = "within_30_minutes"
    config.active_job.queue_adapter = :sidekiq
    config.active_job.deliver_later_queue_name = "background"

    config.cache_store = :redis_cache_store, { url: Rails.application.credentials&.redis&.fetch(:url) }
  end
end
