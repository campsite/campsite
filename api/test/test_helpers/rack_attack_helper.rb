# frozen_string_literal: true

module RackAttackHelper
  def enable_rack_attack(&block)
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

    block.call

    Rack::Attack.reset!
    Rack::Attack.enabled = false
  end

  def simulate_rack_attack_requests(request_count:, ip:)
    request_count.times do
      Rack::Attack.cache.count("requests by ip:ip:#{ip}", Rack::Attack::REQUESTS_BY_IP_PERIOD)
    end
  end
end
