# frozen_string_literal: true

require "yajl" # you can skip this if yajl has already been required.

Blueprinter.configure do |config|
  config.generator = Yajl::Encoder # default is JSON
  config.method = :encode # default is generate

  config.datetime_format = ->(datetime) { datetime.nil? ? datetime : datetime.as_json }
  config.sort_fields_by = :definition
end
