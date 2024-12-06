# frozen_string_literal: true

class PostIndexHealthJob < BaseJob
  sidekiq_options queue: "background"

  def perform
    db_count = Post.all.count
    es_count = Searchkick.client.perform_request("GET", Post.searchkick_index.name + "/_count").body["count"]

    if (db_count - es_count).abs > 15
      Sentry.capture_message("Post index health check failed", extra: { db_count: db_count, es_count: es_count })
    end
  end
end
