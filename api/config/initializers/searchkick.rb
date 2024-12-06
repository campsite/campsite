# frozen_string_literal: true

ENV["ELASTICSEARCH_URL"] = if Rails.env.production?
  "http://campsite-elasticsearch.internal:9200"
else
  "http://localhost:9200"
end
