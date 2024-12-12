# frozen_string_literal: true

require "json"
require "readline"

namespace :dev do
  task change_plan: [:environment] do
    puts "What's the organization's slug?"
    slug = gets.chomp
    puts ""

    puts "What's the new plan? (#{Plan::NAMES.join(", ")})"
    plan_name = gets.chomp
    puts ""

    org = Organization.find_by!(slug: slug)
    org.update!(plan_name: plan_name)

    puts "✅ Updated #{slug} to #{plan_name}."
  end

  desc "Setup Rails custom credentials for development and production if they don't exist"
  task setup_credentials: :environment do
    # Default credentials structure
    DEFAULT_CREDENTIALS = {
      aws: {
        s3_bucket: "TODO",
        access_key_id: "TODO",
        secret_access_key: "TODO",
      },
      aws_ecs: {
        s3_bucket: "TODO",
        access_key_id: "TODO",
        secret_access_key: "TODO",
      },
      cal_dot_com: {
        client_id: "TODO",
        client_secret: "TODO",
        redirect_uri: "TODO",
      },
      campsite: {
        api_url: "http://api.campsite.test:3001",
      },
      figma: {
        client_id: "TODO",
        client_secret: "TODO",
      },
      hms: {
        app_access_key: "TODO",
        app_secret: "TODO",
        webhook_passcode: "TODO",
      },
      imgix: {
        url: "TODO",
        api_key: "TODO",
        source_id: "TODO",
      },
      imgix_folder: {
        url: "TODO",
      },
      imgix_video: {
        url: "TODO",
      },
      linear: {
        token: "TODO",
        client_id: "TODO",
        client_secret: "TODO",
        webhook_signing_secret: "TODO",
      },
      omniauth_google: {
        client_id: "TODO",
        client_secret: "TODO",
      },
      openai: {
        access_token: "TODO",
        organization_id: "TODO",
      },
      plain: {
        api_key: "TODO",
      },
      postmark: {
        api_token: "TODO",
      },
      pusher: {
        app_id: "TODO",
        key: "TODO",
        secret: "TODO",
        cluster: "TODO",
      },
      rack_attack: {
        ssr_secret: "TODO",
        url: "redis://localhost:6379",
      },
      redis_sidekiq: {
        url: "redis://localhost:6379",
      },
      redis: {
        url: "redis://localhost:6379",
      },
      sentry: {
        dsn: "TODO",
      },
      slack: {
        client_id: "TODO",
        client_secret: "TODO",
        signing_secret: "TODO",
      },
      styled_text_api: {
        authtoken: "d8c0a2827589659ff292a8999b024f24a185ed82",
      },
      userlist: {
        push_key: "TODO",
        push_id: "TODO",
      },
      vercel: {
        revalidate_static_cache: "TODO",
      },
      webpush_vapid: {
        public_key: "TODO",
        private_key: "TODO",
      },
      zapier: {
        client_id: "TODO",
        client_secret: "TODO",
        redirect_uri: "TODO",
      },
      tenor: {
        api_key: "TODO",
      },
    }.freeze

    def setup_credentials_for_environment(environment)
      credentials_path = Rails.root.join("config/credentials/#{environment}.yml.enc")
      key_path = Rails.root.join("config/credentials/#{environment}.key")

      if File.exist?(credentials_path)
        puts "#{environment.capitalize} credentials already exist at #{credentials_path}"
        return
      end

      # Create the credentials directory if it doesn't exist
      FileUtils.mkdir_p(Rails.root.join("config/credentials"))

      # Generate a new encryption key if it doesn't exist
      unless File.exist?(key_path)
        encryption_key = SecureRandom.alphanumeric(32)
        File.write(key_path, encryption_key)
        File.chmod(0o600, key_path)
        puts "Generated new encryption key for #{environment} environment"
      end

      # Create new credentials file
      credentials = ActiveSupport::EncryptedConfiguration.new(
        config_path: credentials_path,
        key_path: key_path,
        env_key: "RAILS_MASTER_KEY",
        raise_if_missing_key: true,
      )

      credentials.write(
        {
          active_record_encryption: {
            primary_key: SecureRandom.alphanumeric(32),
            deterministic_key: SecureRandom.alphanumeric(32),
            key_derivation_salt: SecureRandom.alphanumeric(32),
          },
        }.merge(DEFAULT_CREDENTIALS).to_yaml,
      )
      puts "Created new #{environment} credentials at #{credentials_path}"
    end

    ["development", "production"].each do |environment|
      setup_credentials_for_environment(environment)
    end
  end
end
