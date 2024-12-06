# frozen_string_literal: true

class SidekiqPusherSocketIdClientMiddleware
  include Sidekiq::ClientMiddleware

  PUSHER_SOCKET_ID_KEY = "pusher_socket_id"

  def call(_worker_class, job, _queue, _redis_pool = nil)
    job[PUSHER_SOCKET_ID_KEY] = Current.pusher_socket_id
    yield
  end
end
