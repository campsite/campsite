# frozen_string_literal: true

class SidekiqPusherSocketIdServerMiddleware
  include Sidekiq::ServerMiddleware

  def call(_worker, job, _queue)
    Current.pusher_socket_id = job[SidekiqPusherSocketIdClientMiddleware::PUSHER_SOCKET_ID_KEY]
    yield
  end
end
